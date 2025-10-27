#!/bin/bash
set -e

VM_ID=$1
if [ -z "$VM_ID" ]; then
    echo "Usage: $0 <vm_id>"
    exit 1
fi

# Configuration
API_SOCKET="/tmp/firecracker-${VM_ID}.socket"
LOGFILE="/home/sohilathare/firecracker-demo/logs/firecracker-${VM_ID}.log"
TAP_DEV="tap${VM_ID}"
TAP_IP="172.16.${VM_ID}.1"
GUEST_IP="172.16.${VM_ID}.2"
MASK_SHORT="/30"
KERNEL="/home/sohilathare/firecracker-demo/infrastructure/images/vmlinux-6.1.141"
ROOTFS_BASE="/home/sohilathare/firecracker-demo/infrastructure/images/ubuntu-24.04.ext4"
ROOTFS="/home/sohilathare/firecracker-demo/ubuntu-24.04-vm${VM_ID}.ext4"

echo "Starting VM ${VM_ID}..."

# Always create a fresh copy of the rootfs for this VM to ensure clean state
echo "Creating fresh rootfs copy for VM ${VM_ID}..."
rm -f "$ROOTFS"
cp "$ROOTFS_BASE" "$ROOTFS"

# Clean up old socket
sudo rm -f "$API_SOCKET"

# Setup network tap device
sudo ip link del "$TAP_DEV" 2>/dev/null || true
sudo ip tuntap add dev "$TAP_DEV" mode tap
sudo ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
sudo ip link set dev "$TAP_DEV" up

# Enable IP forwarding
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
sudo iptables -P FORWARD ACCEPT

# Get host network interface
HOST_IFACE=$(ip -j route list default | jq -r '.[0].dev')

# Set up NAT
sudo iptables -t nat -D POSTROUTING -o "$HOST_IFACE" -j MASQUERADE 2>/dev/null || true
sudo iptables -t nat -A POSTROUTING -o "$HOST_IFACE" -j MASQUERADE

# Start Firecracker in background
sudo /usr/local/bin/firecracker --api-sock "$API_SOCKET" > "$LOGFILE" 2>&1 &
SUDO_PID=$!

# Wait for socket to be created
sleep 2

# Get the actual firecracker PID (not the sudo wrapper)
FIRECRACKER_PID=$(pgrep -P $SUDO_PID firecracker || echo $SUDO_PID)

# Configure machine
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data '{"vcpu_count": 2, "mem_size_mib": 1024}' \
    "http://localhost/machine-config"

# Configure logger
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data "{\"log_path\": \"$LOGFILE\", \"level\": \"Debug\"}" \
    "http://localhost/logger"

# Set boot source with network configuration
BOOT_ARGS="console=ttyS0 reboot=k panic=1 ip=${GUEST_IP}::${TAP_IP}:255.255.255.252::eth0:off"
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data "{\"kernel_image_path\": \"$KERNEL\", \"boot_args\": \"$BOOT_ARGS\"}" \
    "http://localhost/boot-source"

# Set rootfs
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data "{\"drive_id\": \"rootfs\", \"path_on_host\": \"$ROOTFS\", \"is_root_device\": true, \"is_read_only\": false}" \
    "http://localhost/drives/rootfs"

# Set network
FC_MAC="06:00:AC:10:00:0${VM_ID}"
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data "{\"iface_id\": \"net1\", \"guest_mac\": \"$FC_MAC\", \"host_dev_name\": \"$TAP_DEV\"}" \
    "http://localhost/network-interfaces/net1"

# Start VM
sudo curl -X PUT --unix-socket "$API_SOCKET" \
    --data '{"action_type": "InstanceStart"}' \
    "http://localhost/actions"

echo "VM ${VM_ID} started (PID: $FIRECRACKER_PID)"
echo "$FIRECRACKER_PID" > "/tmp/firecracker-${VM_ID}.pid"