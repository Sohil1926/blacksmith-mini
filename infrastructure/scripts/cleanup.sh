#!/bin/bash
# Clean up all firecracker VMs and resources

echo "Cleaning up Firecracker environment..."

# Kill all firecracker processes
echo "Stopping firecracker processes..."
sudo pkill -9 firecracker 2>/dev/null || true

# Kill orchestrator
echo "Stopping orchestrator..."
pkill -9 -f orchestrator.py 2>/dev/null || true

# Clean up sockets (need sudo)
echo "Removing sockets..."
sudo rm -f /tmp/firecracker-*.socket 2>/dev/null || true
rm -f /tmp/firecracker-*.pid 2>/dev/null || true

# Clean up tap devices
echo "Removing tap devices..."
for i in {1..10}; do
    sudo ip link del tap${i} 2>/dev/null || true
done

# Clean up VM-specific rootfs copies
echo "Removing VM rootfs copies..."
cd /home/sohilathare/firecracker-demo
rm -f ubuntu-24.04-vm*.ext4

# Clean up logs
echo "Removing logs..."
rm -f logs/firecracker-*.log

echo "Cleanup complete!"

