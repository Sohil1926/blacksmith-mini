#!/usr/bin/env python3
import requests
import subprocess
import time
import os
import sys
from .vm_config import *

class VMManager:
    def __init__(self):
        self.active_vms = {}  # {vm_id: {'pid': int, 'ip': str, 'status': str}}
        self.next_vm_id = 1
    
    def get_queued_jobs(self):
        """Fetch queued jobs from GitHub API"""
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs"
        headers = {"Authorization": f"token {GITHUB_TOKEN}"}
        params = {"status": "queued", "per_page": 20}
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                workflow_runs = response.json().get('workflow_runs', [])
                
                # Get jobs for each workflow run
                all_jobs = []
                for run in workflow_runs:
                    jobs_url = run['jobs_url']
                    jobs_response = requests.get(jobs_url, headers=headers, timeout=10)
                    if jobs_response.status_code == 200:
                        jobs = jobs_response.json().get('jobs', [])
                        all_jobs.extend(jobs)
                
                return all_jobs
            else:
                print(f"Error fetching jobs: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def get_runner_registration_token(self):
        """Get a fresh registration token from GitHub"""
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/actions/runners/registration-token"
        headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
        
        try:
            response = requests.post(url, headers=headers, timeout=10)
            if response.status_code == 201:
                return response.json()['token']
            else:
                print(f"Error getting token: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error getting token: {e}")
            return None
    
    def is_vm_alive(self, vm_id):
        """Check if VM is actually alive using multiple methods"""
        vm_info = self.active_vms.get(vm_id)
        if not vm_info:
            return False
        
        guest_ip = vm_info['ip']
        
        # Method 1: Check if we can SSH to the VM (most reliable)
        try:
            result = subprocess.run([
                'ssh', '-i', SSH_KEY_PATH, 
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'ConnectTimeout=1',
                '-o', 'BatchMode=yes',
                f'root@{guest_ip}',
                'echo alive'
            ], capture_output=True, timeout=2)
            
            if result.returncode == 0:
                return True
        except:
            pass
        
        # Method 2: Check if socket exists and is responsive
        socket_path = f"/tmp/firecracker-{vm_id}.socket"
        if os.path.exists(socket_path):
            try:
                result = subprocess.run([
                    'curl', '-s', '--unix-socket', socket_path,
                    '-X', 'GET', 'http://localhost/'
                ], capture_output=True, timeout=1)
                # If we get any response, VM process is alive
                if result.returncode == 0:
                    return True
            except:
                pass
        
        return False
    
    def start_vm(self):
        """Start a new Firecracker VM"""
        if len(self.active_vms) >= MAX_VMS:
            print(f"Max VMs ({MAX_VMS}) already running")
            return None
        
        vm_id = self.next_vm_id
        self.next_vm_id += 1
        
        print(f"\n[VM {vm_id}] Starting...")
        
        try:
            # Start VM using bash script
            result = subprocess.run(
                ['./infrastructure/scripts/start_vm.sh', str(vm_id)],
                cwd=os.path.expanduser('~/firecracker-demo'),
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                print(f"[VM {vm_id}] Failed to start: {result.stderr}")
                return None
            
            # Get Firecracker PID
            pid_file = f"/tmp/firecracker-{vm_id}.pid"
            time.sleep(2)
            
            if os.path.exists(pid_file):
                with open(pid_file, 'r') as f:
                    pid = int(f.read().strip())
            else:
                print(f"[VM {vm_id}] Warning: PID file not found")
                pid = None
            
            guest_ip = f"172.16.{vm_id}.2"
            
            self.active_vms[vm_id] = {
                'pid': pid,
                'ip': guest_ip,
                'status': 'starting',
                'start_time': time.time()
            }
            
            print(f"[VM {vm_id}] Started with IP {guest_ip}")
            
            # Configure runner in VM
            self.configure_runner_in_vm(vm_id, guest_ip)
            
            return vm_id
            
        except subprocess.TimeoutExpired:
            print(f"[VM {vm_id}] Start script timed out after 30s")
            return None
        except Exception as e:
            print(f"[VM {vm_id}] Error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def configure_runner_in_vm(self, vm_id, guest_ip):
        """SSH into VM and configure the GitHub Actions runner"""
        print(f"[VM {vm_id}] Configuring runner...")
        
        try:
            # Wait for SSH to be ready
            ssh_key = SSH_KEY_PATH
            max_attempts = 30
            attempt = 0
            
            while attempt < max_attempts:
                try:
                    result = subprocess.run([
                        'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                        '-o', 'ConnectTimeout=2',
                        f'root@{guest_ip}',
                        'echo "SSH ready"'
                    ], capture_output=True, timeout=5)
                    
                    if result.returncode == 0:
                        print(f"[VM {vm_id}] SSH is ready")
                        break
                except subprocess.TimeoutExpired:
                    pass
                except Exception as e:
                    print(f"[VM {vm_id}] SSH check error: {e}")
                
                attempt += 1
                print(f"[VM {vm_id}] Waiting for SSH... ({attempt}/{max_attempts})")
                time.sleep(2)
            
            if attempt >= max_attempts:
                print(f"[VM {vm_id}] SSH never became ready, aborting")
                self.active_vms[vm_id]['status'] = 'failed'
                return
        
            # Setup networking in VM
            gateway_ip = f"172.16.{vm_id}.1"
            
            subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                f'ip route add default via {gateway_ip} dev eth0'
            ], timeout=10, capture_output=True)
            
            subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
            ], timeout=10, capture_output=True)
        
            # Clean up old runner configuration properly
            print(f"[VM {vm_id}] Removing any existing runner config...")
            
            # First, try to properly remove the runner (ignore errors if not configured)
            remove_token = self.get_runner_registration_token()
            if remove_token:
                remove_cmd = (
                    f'su - runner -c "'
                    f'cd ~/actions-runner && '
                    f'./config.sh remove --token {remove_token} 2>/dev/null || true'
                    f'"'
                )
                try:
                    subprocess.run([
                        'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                        f'root@{guest_ip}',
                        remove_cmd
                    ], timeout=15, capture_output=True)
                except Exception as e:
                    print(f"[VM {vm_id}] Runner removal warning: {e}")
            
            # Also manually clean up any leftover files
            subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                'su - runner -c "cd ~/actions-runner && rm -rf .credentials* .runner .env _diag"'
            ], timeout=10, capture_output=True)
            
            # Get fresh token for configuration
            token = self.get_runner_registration_token()
            if not token:
                print(f"[VM {vm_id}] Failed to get registration token")
                self.active_vms[vm_id]['status'] = 'failed'
                return
        
            # Configure runner as runner user with unique name
            print(f"[VM {vm_id}] Configuring runner...")
            runner_name = f"firecracker-vm-{vm_id}"
            config_cmd = (
                f'su - runner -c "'
                f'cd ~/actions-runner && '
                f'./config.sh --url {REPO_URL} --token {token} --name {runner_name} --unattended --replace --labels self-hosted,linux,x64,firecracker --ephemeral'
                f'"'
            )
            
            result = subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                config_cmd
            ], timeout=30, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"[VM {vm_id}] Runner configuration failed: {result.stderr}")
                self.active_vms[vm_id]['status'] = 'failed'
                return
            
            print(f"[VM {vm_id}] Runner configured successfully")
        
            # Copy shutdown monitor script to VM
            print(f"[VM {vm_id}] Installing shutdown monitor...")
            script_path = os.path.join(
                os.path.dirname(__file__), 
                '../infrastructure/scripts/shutdown-monitor.sh'
            )
            
            result = subprocess.run([
                'scp', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                script_path,
                f'root@{guest_ip}:/tmp/shutdown-monitor.sh'
            ], timeout=10, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"[VM {vm_id}] Warning: Failed to copy shutdown monitor: {result.stderr}")
            else:
                # Make it executable
                subprocess.run([
                    'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                    f'root@{guest_ip}',
                    'chmod +x /tmp/shutdown-monitor.sh'
                ], timeout=5, capture_output=True)
            
            # Configure runner to disable auto-update
            print(f"[VM {vm_id}] Disabling runner auto-update...")
            subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                'su - runner -c "cd ~/actions-runner && printf \'DISABLE_RUNNER_UPDATE=1\\nRUNNER_ALLOW_RUNASROOT=1\\n\' > .env"'
            ], timeout=10, capture_output=True)
            
            # Start runner
            print(f"[VM {vm_id}] Starting runner...")
            start_cmd = (
                'su - runner -c "'
                'cd ~/actions-runner && '
                'export RUNNER_ALLOW_RUNASROOT=1 && '
                'export DISABLE_RUNNER_UPDATE=1 && '
                './run.sh --once --disableupdate &'
                '"'
            )
            
            try:
                subprocess.run([
                    'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                    f'root@{guest_ip}',
                    start_cmd
                ], timeout=5)
            except subprocess.TimeoutExpired:
                print(f"[VM {vm_id}] Runner start command timed out (normal for background process)")
            
            # Start the shutdown monitor
            print(f"[VM {vm_id}] Starting shutdown monitor...")
            subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                'nohup /tmp/shutdown-monitor.sh &'
            ], timeout=5, capture_output=True)
            
            # Verify runner is running
            time.sleep(3)
            check_cmd = 'su - runner -c "pgrep -f run.sh"'
            result = subprocess.run([
                'ssh', '-i', ssh_key, '-o', 'StrictHostKeyChecking=no',
                f'root@{guest_ip}',
                check_cmd
            ], capture_output=True, timeout=5)
            
            if result.returncode == 0:
                print(f"[VM {vm_id}] Runner is running (PID: {result.stdout.decode().strip()})")
            else:
                print(f"[VM {vm_id}] Warning: Runner may not have started")
            
            self.active_vms[vm_id]['status'] = 'running'
            print(f"[VM {vm_id}] Configuration complete - VM will auto-shutdown after job")
            
        except Exception as e:
            print(f"[VM {vm_id}] Fatal error during configuration: {e}")
            import traceback
            traceback.print_exc()
            self.active_vms[vm_id]['status'] = 'failed'
    
    def cleanup_dead_vms(self):
        """Remove VMs that are no longer running or failed"""
        dead_vms = []
        current_time = time.time()
        
        for vm_id, vm_info in self.active_vms.items():
            status = vm_info.get('status')
            start_time = vm_info.get('start_time', current_time)
            
            # Remove failed VMs immediately
            if status == 'failed':
                dead_vms.append((vm_id, 'failed'))
                continue
            
            # Remove VMs that have been starting for too long (5 minutes)
            if status == 'starting' and (current_time - start_time) > 300:
                print(f"[VM {vm_id}] Startup timeout exceeded")
                dead_vms.append((vm_id, 'timeout'))
                continue
            
            # For running VMs, check if they're still alive
            if status == 'running':
                # Check max runtime (1 hour)
                if (current_time - start_time) > 3600:
                    print(f"[VM {vm_id}] Max runtime exceeded (1 hour)")
                    dead_vms.append((vm_id, 'max_runtime_exceeded'))
                    continue
                
                # Check if VM is actually alive
                if not self.is_vm_alive(vm_id):
                    dead_vms.append((vm_id, 'vm_shutdown'))
                    continue
        
        for vm_id, reason in dead_vms:
            print(f"\n[VM {vm_id}] Removing from tracking (reason: {reason})")
            
            # Kill firecracker process if still running
            pid = self.active_vms[vm_id].get('pid')
            if pid:
                try:
                    os.kill(pid, 9)
                    print(f"[VM {vm_id}] Killed firecracker process (PID: {pid})")
                except:
                    pass
            
            # Clean up VM-specific files
            try:
                rootfs = f"/home/sohilathare/firecracker-demo/ubuntu-24.04-vm{vm_id}.ext4"
                if os.path.exists(rootfs):
                    os.remove(rootfs)
                    print(f"[VM {vm_id}] Cleaned up rootfs copy")
            except Exception as e:
                print(f"[VM {vm_id}] Warning: couldn't clean up rootfs: {e}")
            
            # Clean up socket
            socket_path = f"/tmp/firecracker-{vm_id}.socket"
            try:
                if os.path.exists(socket_path):
                    subprocess.run(['sudo', 'rm', '-f', socket_path], timeout=2)
            except:
                pass
            
            # Clean up tap device
            tap_dev = f"tap{vm_id}"
            try:
                subprocess.run(['sudo', 'ip', 'link', 'del', tap_dev], 
                             capture_output=True, timeout=2)
            except:
                pass
            
            del self.active_vms[vm_id]
    
    def run(self):
        """Main orchestrator loop"""
        print("=" * 60)
        print("GitHub Actions Orchestrator")
        print(f"Repository: {REPO_URL}")
        print(f"Polling interval: {POLL_INTERVAL}s")
        print(f"Max VMs: {MAX_VMS}")
        print("=" * 60)
        print("\nPress Ctrl+C to stop\n")
        
        while True:
            try:
                # Clean up dead VMs FIRST (before checking queued jobs)
                old_vm_count = len(self.active_vms)
                self.cleanup_dead_vms()
                new_vm_count = len(self.active_vms)
                
                # Show VM death events clearly
                if new_vm_count < old_vm_count:
                    vms_died = old_vm_count - new_vm_count
                    print(f"\n✓ {vms_died} VM(s) completed and shut down")
                
                # Get queued jobs AFTER cleanup
                queued_jobs = self.get_queued_jobs()
                
                print(f"\r[{time.strftime('%H:%M:%S')}] Queued: {len(queued_jobs)} | Active VMs: {new_vm_count}", end='', flush=True)
                
                if queued_jobs:
                    print()  # New line for cleaner output
                    for job in queued_jobs:
                        print(f"  - Job: {job['name']} (Status: {job['status']})")
                    
                    # Calculate how many VMs to start
                    vms_needed = min(
                        len(queued_jobs) - new_vm_count,
                        MAX_VMS - new_vm_count
                    )
                    
                    if vms_needed > 0:
                        print(f"\nStarting {vms_needed} new VM(s)...")
                        for _ in range(vms_needed):
                            self.start_vm()
                
                time.sleep(POLL_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n\nShutting down orchestrator...")
                print("Note: VMs will continue running. Stop them manually if needed.")
                sys.exit(0)
            except Exception as e:
                print(f"\nError in main loop: {e}")
                time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    # Check if token is set
    if GITHUB_TOKEN == "your_github_token_here":
        print("Error: Please set your GitHub token in vm_config.py")
        sys.exit(1)
    
    manager = VMManager()
    manager.run()