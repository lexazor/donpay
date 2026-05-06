#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/donpay}"
REPO_URL="${REPO_URL:-https://github.com/lexazor/donpay.git}"
BRANCH="${BRANCH:-main}"

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

install_docker() {
  if command -v docker >/dev/null 2>&1 && command -v docker compose >/dev/null 2>&1; then
    print_step "Docker + Docker Compose sudah terpasang"
    return
  fi

  print_step "Menginstall Docker dan plugin Compose"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
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

  if grep -q "change-this-secret" "$APP_DIR/docker-compose.yml"; then
    echo ""
    echo "PERHATIAN: ubah secret JWT pada docker-compose.yml sebelum production publik."
  fi
}

start_services() {
  print_step "Build dan jalankan semua service"
  docker compose -f "$APP_DIR/docker-compose.yml" up -d --build

  print_step "Jalankan migrasi Prisma"
  docker compose -f "$APP_DIR/docker-compose.yml" exec -T backend npm run prisma:migrate || true
  docker compose -f "$APP_DIR/docker-compose.yml" exec -T backend npm run prisma:generate
}

final_output() {
  print_step "Instalasi selesai"
  echo "Frontend: http://SERVER_IP:3000"
  echo "Backend:  http://SERVER_IP:3001"
  echo ""
  echo "Cek status container:"
  echo "docker compose -f $APP_DIR/docker-compose.yml ps"
  echo ""
  echo "Cek log realtime:"
  echo "docker compose -f $APP_DIR/docker-compose.yml logs -f"
}

main() {
  require_root
  install_docker
  clone_or_update_repo
  prepare_env
  start_services
  final_output
}

main "$@"
