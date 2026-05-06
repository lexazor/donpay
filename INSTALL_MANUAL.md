# Instalasi Manual DonPay (Step by Step)

Panduan ini untuk VPS Ubuntu 22.04/24.04 (termasuk server dengan aaPanel).

## 1) Login ke VPS
```bash
ssh root@IP_SERVER
```

## 2) Install dependency dasar
```bash
apt update -y
apt install -y git curl ca-certificates gnupg lsb-release
```

## 3) Install Docker + Docker Compose Plugin
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

## 4) Clone repository
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/lexazor/donpay.git
cd donpay
```

## 5) Siapkan environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Wajib diubah sebelum production:
- `backend/.env`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `DATABASE_URL` (jika tidak pakai mysql dari compose)
- `frontend/.env`
  - `NEXT_PUBLIC_API_URL` (arah ke domain API produksi)
- `docker-compose.yml`
  - ganti nilai default secret dan password MySQL

## 6) Jalankan aplikasi
```bash
docker compose up -d --build
```

## 7) Jalankan migrasi database
```bash
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

## 8) Verifikasi
```bash
docker compose ps
docker compose logs -f --tail=100
```

Endpoint default:
- Frontend: `http://IP_SERVER:3000`
- Backend: `http://IP_SERVER:3001`

## 9) Reverse proxy di aaPanel
- Website/domain frontend -> `127.0.0.1:3000`
- Website/domain backend -> `127.0.0.1:3001`
- Aktifkan SSL Let’s Encrypt untuk kedua domain

## 10) Command penting operasional
```bash
docker compose restart
docker compose down
docker compose up -d
docker compose logs -f backend
docker compose logs -f frontend
```
