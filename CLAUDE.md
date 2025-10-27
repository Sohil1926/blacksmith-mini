# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Actions self-hosted runner orchestrator using AWS Firecracker microVMs. The system automatically provisions ephemeral Firecracker VMs to handle GitHub Actions workflow jobs, then terminates them after completion.

**Key concept**: Each VM is ephemeral and configured with the `--ephemeral` flag, meaning it auto-deregisters from GitHub after running a single job. The shutdown monitor script (`shutdown-monitor.sh`) detects when the runner process completes and triggers VM shutdown. The orchestrator detects dead VMs and cleans up resources.

## Architecture

### Core Components

1. **Orchestrator** (`backend/orchestrator.py`):
   - Main control loop that polls GitHub API for queued jobs
   - Manages VM lifecycle: creation, monitoring, cleanup
   - Class: `VMManager` with methods:
     - `get_queued_jobs()`: Polls GitHub Actions API
     - `start_vm()`: Creates new Firecracker VM
     - `configure_runner_in_vm()`: SSH setup of GitHub Actions runner
     - `cleanup_dead_vms()`: Removes terminated VMs and cleans resources
     - `is_vm_alive()`: Health checks via SSH

2. **VM Configuration** (`backend/vm_config.py`):
   - Centralized configuration for GitHub repo, tokens, paths
   - **IMPORTANT**: Contains GitHub PAT token (gitignored for security)
   - VM resource limits (vCPU, memory)
   - Network configuration (IP ranges, TAP device naming)

3. **VM Startup** (`infrastructure/scripts/start_vm.sh`):
   - Creates fresh rootfs copy from base image for each VM
   - Configures TAP network device with unique IP per VM (`172.16.{vm_id}.0/30`)
   - Sets up NAT/IP forwarding for internet access
   - Launches Firecracker via API socket with kernel and rootfs
   - Network scheme: Each VM gets `/30` subnet (172.16.1.0/30, 172.16.2.0/30, etc.)

4. **Shutdown Monitor** (`infrastructure/scripts/shutdown-monitor.sh`):
   - Runs inside each VM to detect job completion
   - Monitors for `Runner.Worker` process
   - Triggers `poweroff -f` when runner completes or max runtime exceeded
   - Logs to `/tmp/shutdown-monitor.log` inside VM

### Infrastructure Layout

```
infrastructure/
├── bin/release-v1.13.1-x86_64/  # Firecracker v1.13.1 binaries
├── images/
│   ├── ubuntu-24.04.ext4         # Base rootfs (5GB, pre-configured with runner)
│   ├── vmlinux-6.1.141           # Linux kernel
│   └── actions-runner/           # GitHub Actions runner installation files
├── keys/                         # SSH keys for VM access (gitignored)
├── scripts/                      # VM management scripts
└── templates/                    # Runner helper templates
```

### VM Lifecycle

1. Orchestrator detects queued GitHub Actions jobs
2. Calls `start_vm.sh {vm_id}` which:
   - Creates fresh rootfs copy: `ubuntu-24.04-vm{id}.ext4`
   - Sets up tap{id} network device
   - Launches Firecracker with API socket at `/tmp/firecracker-{id}.socket`
3. Orchestrator SSH's into VM to:
   - Configure networking (default route, DNS)
   - Register GitHub Actions runner with unique name `firecracker-vm-{id}`
   - Deploy and start shutdown monitor
   - Start runner with `--once` flag (ephemeral mode)
4. VM runs job and runner exits
5. Shutdown monitor detects exit and powers off VM
6. Orchestrator detects dead VM via `is_vm_alive()` checks
7. Cleanup: kills process, removes rootfs copy, deletes tap device

## Running the System

### Prerequisites

- Firecracker installed at `/usr/local/bin/firecracker` (or update path in config)
- Base VM image built with GitHub Actions runner pre-installed
- SSH key generated for VM access
- GitHub Personal Access Token with `repo` scope
- Python 3 with `requests` library
- `sudo` access for network configuration

### Configuration

1. Copy `backend/vm_config.py.example` to `backend/vm_config.py` (if template exists)
2. Set your GitHub token and repository details in `backend/vm_config.py`
3. Verify paths in `vm_config.py` match your setup:
   - `KERNEL_PATH`: Linux kernel location
   - `ROOTFS_PATH`: Base Ubuntu 24.04 ext4 image
   - `SSH_KEY_PATH`: SSH private key for root@vm access

### Starting the Orchestrator

```bash
# From project root
python3 -m backend.orchestrator

# Or directly
cd backend && python3 orchestrator.py
```

The orchestrator will:
- Poll every 5 seconds (configurable via `POLL_INTERVAL`)
- Show real-time status: `[HH:MM:SS] Queued: X | Active VMs: Y`
- Auto-start VMs up to `MAX_VMS` limit (default: 5)
- Auto-cleanup completed VMs

### Manual VM Operations

Start a single VM manually:
```bash
./infrastructure/scripts/start_vm.sh 1
```

Cleanup all VMs:
```bash
./infrastructure/scripts/cleanup.sh
```

### Monitoring

- Orchestrator logs to stdout
- Per-VM Firecracker logs: `logs/firecracker-{vm_id}.log`
- Shutdown monitor logs (inside VM): `/tmp/shutdown-monitor.log`
- Check VM status via SSH: `ssh -i infrastructure/keys/ubuntu-24.04.id_rsa root@172.16.{vm_id}.2`

## Key Implementation Details

### Networking

- Each VM gets a `/30` network with 2 usable IPs:
  - Host TAP IP: `172.16.{vm_id}.1`
  - Guest VM IP: `172.16.{vm_id}.2`
- NAT configured via iptables MASQUERADE
- DNS set to 8.8.8.8 inside VM
- Network interface: `eth0` in guest, `tap{vm_id}` on host

### Security Considerations

- `vm_config.py` is gitignored to protect GitHub token
- SSH keys stored in `infrastructure/keys/` (also gitignored)
- VMs run as root but are isolated via Firecracker
- Each VM gets fresh rootfs copy to prevent cross-contamination
- Max runtime limit prevents runaway VMs (1 hour default)

### VM Image Preparation

The base `ubuntu-24.04.ext4` image must be pre-configured with:
- GitHub Actions runner installed in `/home/runner/actions-runner`
- User `runner` created with proper permissions
- SSH server enabled with root login via key
- Network tools (ip, curl, etc.)
- Python, git, and common build tools

### Resource Limits

Per VM (configurable in `vm_config.py`):
- vCPUs: 2
- Memory: 1024 MB
- Disk: 5 GB (rootfs size)
- Max concurrent VMs: 5
- Max runtime: 1 hour

### GitHub Actions Integration

Runners are registered with labels: `self-hosted`, `linux`, `x64`, `firecracker`

Use in workflows:
```yaml
jobs:
  my-job:
    runs-on: [self-hosted, linux, firecracker]
    steps:
      - uses: actions/checkout@v4
      - run: echo "Running on Firecracker VM!"
```

## Common Issues

### VM fails to start
- Check Firecracker binary path and permissions
- Verify kernel and rootfs paths exist
- Check `logs/firecracker-*.log` for errors
- Ensure sudo access for network setup

### Runner registration fails
- Verify GitHub token has correct permissions
- Check token hasn't expired (tokens expire after 1 hour)
- Ensure repository URL is correct in `vm_config.py`

### VM doesn't shut down
- Check shutdown monitor is running: `pgrep -f shutdown-monitor`
- Verify runner completed: `pgrep -f Runner.Worker` should return empty
- Check `/tmp/shutdown-monitor.log` inside VM

### Network connectivity issues
- Verify IP forwarding: `cat /proc/sys/net/ipv4/ip_forward` should be `1`
- Check iptables NAT rules: `sudo iptables -t nat -L`
- Ensure tap device exists: `ip link show tap{vm_id}`

## File Paths to Remember

- Main orchestrator: `backend/orchestrator.py`
- Configuration: `backend/vm_config.py` (gitignored, must create)
- VM startup script: `infrastructure/scripts/start_vm.sh`
- Shutdown monitor: `infrastructure/scripts/shutdown-monitor.sh`
- Base VM image: `infrastructure/images/ubuntu-24.04.ext4`
- Kernel: `infrastructure/images/vmlinux-6.1.141`
- Firecracker binary: `/usr/local/bin/firecracker` or `infrastructure/bin/release-v1.13.1-x86_64/firecracker-v1.13.1-x86_64`
