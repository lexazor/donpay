# DonPay Deployment Guide

Deploy DonPay (Next.js + NestJS + MySQL + Prisma) ke VPS/aaPanel dengan cepat, aman, dan mudah di-maintain.

## Ringkasan
- Repo: `https://github.com/lexazor/donpay.git`
- Path standar server: `/www/wwwroot/donpay`
- Service default:
  - Frontend: `3000`
  - Backend API: `3001`
  - MySQL: `3306`

## Opsi 1 — Instalasi Otomatis (Direkomendasikan)

### 1) Jalankan dari VPS
```bash
cd /root
wget -O install.sh https://raw.githubusercontent.com/lexazor/donpay/main/install.sh
chmod +x install.sh
sudo APP_DIR=/www/wwwroot/donpay REPO_URL=https://github.com/lexazor/donpay.git BRANCH=main ./install.sh
```

### 2) Yang dilakukan `install.sh`
- Install Docker + Docker Compose (jika belum ada)
- Clone/pull repository `donpay`
- Generate file `.env` dari `.env.example` (jika belum ada)
- Build + run semua container via `docker compose`
- Jalankan `prisma:migrate` dan `prisma:generate`

## Opsi 2 — Instalasi Manual (Step by Step)

### 1) Login VPS
```bash
ssh root@IP_SERVER
```

### 2) Install dependency dasar
```bash
apt update -y
apt install -y git curl ca-certificates gnupg lsb-release
```

### 3) Install Docker + Docker Compose plugin
```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update -y
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
```

### 4) Clone project ke path standar aaPanel
```bash
mkdir -p /www/wwwroot
cd /www/wwwroot
git clone https://github.com/lexazor/donpay.git
cd donpay
```

### 5) Buat file environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 6) Ubah nilai penting production
- `backend/.env`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `DATABASE_URL` (jika tidak pakai DB container lokal)
- `frontend/.env`
  - `NEXT_PUBLIC_API_URL` (domain API production)
- `docker-compose.yml`
  - password MySQL
  - secret default

### 7) Build dan jalankan
```bash
docker compose up -d --build
```

### 8) Migrasi database
```bash
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

### 9) Verifikasi
```bash
docker compose ps
docker compose logs -f --tail=100
```

## Konfigurasi aaPanel (Reverse Proxy + SSL)
- Domain frontend -> `127.0.0.1:3000`
- Domain backend -> `127.0.0.1:3001`
- Aktifkan SSL Let’s Encrypt untuk keduanya

## Panduan Update via Terminal

### Update semua service
```bash
cd /www/wwwroot/donpay
git fetch origin
git checkout main
git pull origin main
docker compose up -d --build
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

### Update backend saja
```bash
cd /www/wwwroot/donpay
git pull origin main
docker compose build backend
docker compose up -d backend
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

### Update frontend saja
```bash
cd /www/wwwroot/donpay
git pull origin main
docker compose build frontend
docker compose up -d frontend
```

### Cek status/log setelah update
```bash
docker compose ps
docker compose logs -f --tail=100 backend
docker compose logs -f --tail=100 frontend
```

### Rollback cepat
```bash
cd /www/wwwroot/donpay
git log --oneline -n 10
git checkout <commit_stabil>
docker compose up -d --build
```

## Backup Database Sebelum Update Besar
```bash
cd /www/wwwroot/donpay
docker compose exec -T mysql mysqldump -uroot -pROOT_PASSWORD donpay > backup-$(date +%F-%H%M).sql
```

## Operasional Harian
```bash
cd /www/wwwroot/donpay
docker compose restart
docker compose down
docker compose up -d
docker compose logs -f backend
docker compose logs -f frontend
```

## Checklist Production
- Ganti semua secret default
- Batasi akses MySQL hanya internal/private network
- Aktifkan backup otomatis harian
- Aktifkan monitoring resource + alert
- Gunakan domain + HTTPS penuh
