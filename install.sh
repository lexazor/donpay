#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/donpay}"
REPO_URL="${REPO_URL:-https://github.com/lexazor/donpay.git}"
BRANCH="${BRANCH:-main}"
DB_NAME="${DB_NAME:-donpay}"
DB_USER="${DB_USER:-donpay}"
DB_PASSWORD="${DB_PASSWORD:-ChangeThisDbPassword123!}"
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

print_step() {
  echo ""
  echo "[DONPAY] $1"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Script ini harus dijalankan sebagai root (sudo)."
    exit 1
  fi
}

install_base_packages() {
  print_step "Install paket dasar"
  apt-get update -y
  apt-get install -y git curl ca-certificates gnupg lsb-release mysql-server

  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi

  npm install -g pm2
}

clone_or_update_repo() {
  if [[ -d "$APP_DIR/.git" ]]; then
    print_step "Repo sudah ada, update branch $BRANCH"
    git -C "$APP_DIR" fetch origin
    git -C "$APP_DIR" checkout "$BRANCH"
    git -C "$APP_DIR" pull origin "$BRANCH"
  else
    print_step "Clone repository ke $APP_DIR"
    mkdir -p "$APP_DIR"
    git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  fi
}

prepare_env() {
  print_step "Menyiapkan file environment"

  if [[ ! -f "$APP_DIR/backend/.env" ]]; then
    cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  fi

  if [[ ! -f "$APP_DIR/frontend/.env" ]]; then
    cp "$APP_DIR/frontend/.env.example" "$APP_DIR/frontend/.env"
  fi

  if ! grep -q '^JWT_REFRESH_SECRET=' "$APP_DIR/backend/.env"; then
    echo 'JWT_REFRESH_SECRET="replace-with-strong-refresh-secret"' >> "$APP_DIR/backend/.env"
  fi
}

setup_mysql() {
  print_step "Konfigurasi MySQL lokal"
  systemctl enable mysql
  systemctl start mysql

  mysql -uroot <<SQL
CREATE DATABASE IF NOT EXISTS \\`$DB_NAME\\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \\`$DB_NAME\\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL

  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME\"|" "$APP_DIR/backend/.env"
}

build_apps() {
  print_step "Install dependency backend/frontend"
  npm --prefix "$APP_DIR/backend" install
  npm --prefix "$APP_DIR/frontend" install

  print_step "Build production"
  npm --prefix "$APP_DIR/backend" run prisma:generate
  npm --prefix "$APP_DIR/backend" run build
  npm --prefix "$APP_DIR/frontend" run build

  print_step "Migrasi Prisma"
  npm --prefix "$APP_DIR/backend" run prisma:migrate || true
}

start_pm2() {
  print_step "Menjalankan aplikasi via PM2"
  pm2 delete donpay-backend donpay-frontend >/dev/null 2>&1 || true
  FRONTEND_PORT="$FRONTEND_PORT" BACKEND_PORT="$BACKEND_PORT" pm2 start "$APP_DIR/ecosystem.config.cjs"
  pm2 save
}

final_output() {
  print_step "Instalasi selesai"
  echo "Frontend: http://SERVER_IP:$FRONTEND_PORT"
  echo "Backend:  http://SERVER_IP:$BACKEND_PORT"
  echo ""
  echo "Cek status PM2:"
  echo "pm2 list"
  echo ""
  echo "Cek log realtime:"
  echo "pm2 logs"
}

main() {
  require_root
  install_base_packages
  clone_or_update_repo
  prepare_env
  setup_mysql
  build_apps
  start_pm2
  final_output
}

main "$@"
