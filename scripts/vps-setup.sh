#!/usr/bin/env bash
# One-time VPS setup: Node.js, PM2, nginx, clone repo
# Run as root: bash scripts/vps-setup.sh
set -e

REPO="https://github.com/rolandkirsche/hitmango.git"
APP_DIR="/var/www/hitmango"

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "==> Installing PM2 & nginx..."
npm install -g pm2
apt-get install -y nginx

echo "==> Cloning repo..."
mkdir -p /var/www
git clone "$REPO" "$APP_DIR"
cd "$APP_DIR"

echo "==> Building app..."
npm ci
npm run build

echo "==> Starting with PM2..."
pm2 start npm --name hitmango -- start --port 3000
pm2 save
pm2 startup | tail -1 | bash

echo "==> Configuring nginx..."
cat > /etc/nginx/sites-available/hitmango <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/hitmango /etc/nginx/sites-enabled/hitmango
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Opening firewall for port 80..."
ufw allow 80/tcp
ufw allow 22/tcp
ufw --force enable

echo ""
echo "Done! App running at http://31.70.81.236"
