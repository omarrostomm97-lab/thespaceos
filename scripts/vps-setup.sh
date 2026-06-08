#!/usr/bin/env bash
# =============================================================================
# TheSpaceOS — One-shot VPS setup script
# Run as root on a fresh Ubuntu 22.04 / 24.04 DigitalOcean droplet:
#   bash scripts/vps-setup.sh
# =============================================================================
set -euo pipefail

REPO_URL="https://github.com/omarrostomm97-lab/thespaceos.git"
APP_DIR="/var/www/thespaceos"
LOG_DIR="/var/log/thespaceos"
DB_NAME="thespaceos"
DB_USER="spaceuser"

echo ""
echo "=================================================="
echo "  TheSpaceOS — VPS Setup"
echo "=================================================="
echo ""

# ── 1. System packages ────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq nginx postgresql postgresql-contrib curl git ufw

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
apt-get install -y -qq nodejs

# ── 3. pnpm + PM2 ─────────────────────────────────────────────────────────────
echo "[3/8] Installing pnpm and PM2..."
npm install -g pnpm pm2 --silent

# ── 4. PostgreSQL ─────────────────────────────────────────────────────────────
echo "[4/8] Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

read -r -s -p "Enter a strong password for the database user '$DB_USER': " DB_PASS
echo ""

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  (database already exists)"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "  (user already exists)"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

# ── 5. Clone repo ─────────────────────────────────────────────────────────────
echo "[5/8] Cloning repository..."
mkdir -p "$APP_DIR" "$LOG_DIR"
if [ -d "$APP_DIR/.git" ]; then
  echo "  Repo already exists, pulling latest..."
  git -C "$APP_DIR" pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

# ── 6. Environment file ───────────────────────────────────────────────────────
echo "[6/8] Setting up environment file..."
SESSION_SECRET=$(openssl rand -hex 32)

if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
PORT=3001
NODE_ENV=production
SESSION_SECRET=${SESSION_SECRET}
BASE_PATH=/
EOF
  echo "  .env created at $APP_DIR/.env"
  echo "  !! Review and add any missing secrets (email keys, etc.) !!"
else
  echo "  .env already exists — skipping"
fi

# ── 7. Build app ──────────────────────────────────────────────────────────────
echo "[7/8] Installing dependencies and building..."
cd "$APP_DIR"
export $(grep -v '^#' .env | xargs)
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/gaming-lounge run build

# Run DB migrations
echo "  Running database migrations..."
pnpm --filter @workspace/db run push || echo "  (migration skipped or already up-to-date)"

# ── 8. PM2 + nginx ────────────────────────────────────────────────────────────
echo "[8/8] Starting services..."

# PM2
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

# nginx
cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/thespaceos
ln -sf /etc/nginx/sites-available/thespaceos /etc/nginx/sites-enabled/thespaceos
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
systemctl enable nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "=================================================="
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit nginx.conf: replace YOUR_DOMAIN_OR_IP"
echo "     sudo nano /etc/nginx/sites-available/thespaceos"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "  2. Install HTTPS (free SSL):"
echo "     sudo apt install -y certbot python3-certbot-nginx"
echo "     sudo certbot --nginx -d yourdomain.com"
echo ""
echo "  3. Set up auto-deploy:"
echo "     See .github/workflows/deploy.yml"
echo "     Add these GitHub Secrets:"
echo "       VPS_HOST, VPS_USER, VPS_SSH_KEY"
echo "=================================================="
