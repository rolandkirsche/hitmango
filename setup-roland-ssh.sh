#!/usr/bin/env bash
set -e

PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBPxdYKNP8t1OHqEmH5yPKnykU3MTFW3V4tUB/slhMnF Strato VPS"
VPS="root@31.70.81.236"
KEY="~/.ssh/id_ed25519"

echo "Setting up SSH access for roland@31.70.81.236 ..."

ssh -i "$KEY" "$VPS" "
  # Create roland user if it doesn't exist
  id roland &>/dev/null || useradd -m -s /bin/bash roland

  # Set up .ssh directory
  mkdir -p /home/roland/.ssh
  chmod 700 /home/roland/.ssh

  # Add public key
  grep -qF '$PUBKEY' /home/roland/.ssh/authorized_keys 2>/dev/null \
    || echo '$PUBKEY' >> /home/roland/.ssh/authorized_keys

  chmod 600 /home/roland/.ssh/authorized_keys
  chown -R roland:roland /home/roland/.ssh

  echo 'Done.'
"

echo ""
echo "Testing connection as roland ..."
ssh -i "$KEY" roland@31.70.81.236 'echo "Logged in as: \$(whoami)"'
