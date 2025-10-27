#!/bin/bash
# Setup passwordless sudo for Firecracker commands

set -e

echo "================================================"
echo "Firecracker Passwordless Sudo Setup"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "ERROR: Do not run this script as root/sudo"
    echo "Please run as: ./setup_firecracker_sudo.sh"
    exit 1
fi

CURRENT_USER=$(whoami)
SUDOERS_FILE="/etc/sudoers.d/firecracker"

echo "Setting up passwordless sudo for user: $CURRENT_USER"
echo ""

# Create temporary sudoers content
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << EOF
# Firecracker passwordless sudo configuration
# Created on $(date)

# Allow Firecracker socket management
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/rm -f /tmp/firecracker-*.socket

# Allow network configuration
$CURRENT_USER ALL=(ALL) NOPASSWD: /sbin/ip
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/ip
$CURRENT_USER ALL=(ALL) NOPASSWD: /sbin/iptables
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/iptables

# Allow IP forwarding
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/sh -c echo 1 > /proc/sys/net/ipv4/ip_forward
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/tee /proc/sys/net/ipv4/ip_forward

# Allow Firecracker binary
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/local/bin/firecracker

# Allow curl for API calls
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/curl
EOF

echo "Validating sudoers syntax..."
sudo visudo -c -f "$TEMP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Syntax validation passed"
    echo ""
    echo "Installing sudoers file..."
    sudo cp "$TEMP_FILE" "$SUDOERS_FILE"
    sudo chmod 0440 "$SUDOERS_FILE"
    sudo chown root:root "$SUDOERS_FILE"
    echo "✓ Sudoers file installed: $SUDOERS_FILE"
    echo ""
    echo "Testing sudo access..."
    
    # Test a simple sudo command
    if sudo -n ip link show > /dev/null 2>&1; then
        echo "✓ Passwordless sudo is working!"
        echo ""
        echo "================================================"
        echo "Setup complete! You can now run VMs without"
        echo "being prompted for a password."
        echo "================================================"
    else
        echo "⚠ Warning: Passwordless sudo test failed."
        echo "You may need to log out and log back in."
    fi
else
    echo "✗ Syntax validation failed!"
    exit 1
fi

# Cleanup
rm -f "$TEMP_FILE"