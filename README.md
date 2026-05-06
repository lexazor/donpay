# DonPay VPS Guide (PM2, Tanpa Docker)

Panduan ini khusus untuk pemula dan sudah full **tanpa Docker**.
Target deploy: **Node.js + PM2 + MySQL lokal** di VPS (Ubuntu) dan bisa dipakai di aaPanel.

## Struktur dan Lokasi Penting
- Repo: `https://github.com/lexazor/donpay.git`
- Folder app: `/www/wwwroot/donpay`
- Backend env: `/www/wwwroot/donpay/backend/.env`
- Frontend env: `/www/wwwroot/donpay/frontend/.env`
- PM2 config: `/www/wwwroot/donpay/ecosystem.config.cjs`

## Sebelum Mulai

- OS disarankan: Ubuntu 22.04/24.04
- Akses: user `root` atau user dengan `sudo`
- Domain (opsional tapi disarankan):
  - frontend: misal `app.domainkamu.com`
  - backend: misal `api.domainkamu.com`
- Port internal aplikasi:
  - frontend: `3000`
  - backend: `3001`

## Opsi A — Instalasi Otomatis (Paling Mudah)

Jalankan di VPS:

```bash
cd /root
wget -O install.sh https://raw.githubusercontent.com/lexazor/donpay/main/install.sh
chmod +x install.sh
sudo APP_DIR=/www/wwwroot/donpay REPO_URL=https://github.com/lexazor/donpay.git BRANCH=main DB_NAME=donpay DB_USER=donpay DB_PASSWORD='GantiPasswordKuat!' ./install.sh
```

`install.sh` akan otomatis:
- install Node.js 20, PM2, MySQL server
- clone/update repo
- membuat `.env` dari `.env.example`
- membuat database/user MySQL
- build backend + frontend
- migrate Prisma
- start app dengan PM2

Setelah selesai, lanjut ke bagian **Reverse Proxy di aaPanel** agar domain bisa diakses publik.

## Opsi B — Instalasi Manual Step-by-Step

### 1) Install dependency server

```bash
apt update -y
apt install -y git curl ca-certificates gnupg lsb-release mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

### 2) Clone project

```bash
mkdir -p /www/wwwroot
cd /www/wwwroot
git clone https://github.com/lexazor/donpay.git
cd donpay
```

### 3) Buat env file

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Tips: semua nilai rahasia di `.env` wajib diganti (jangan pakai contoh default untuk production).

### 4) Isi env backend (wajib)

Edit:

```bash
nano /www/wwwroot/donpay/backend/.env
```

Contoh aman:

```env
PORT=3001
DATABASE_URL="mysql://donpay:GantiPasswordKuat!@localhost:3306/donpay"
JWT_SECRET="ISI_SECRET_ACCESS_MIN_32_CHAR"
JWT_REFRESH_SECRET="ISI_SECRET_REFRESH_MIN_32_CHAR"
```

### 5) Isi env frontend (wajib)

Edit:

```bash
nano /www/wwwroot/donpay/frontend/.env
```

Contoh:

```env
NEXT_PUBLIC_API_URL="https://api.domainkamu.com"
```

Kalau belum pakai domain/SSL, sementara bisa isi:

```env
NEXT_PUBLIC_API_URL="http://SERVER_IP:3001"
```

### 6) Buat database dan user MySQL

```bash
mysql -uroot
```

Lalu jalankan di prompt MySQL:

```sql
CREATE DATABASE donpay;
CREATE USER 'donpay'@'localhost' IDENTIFIED BY 'GantiPasswordKuat!';
GRANT ALL PRIVILEGES ON donpay.* TO 'donpay'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 7) Install dependency + build

```bash
cd /www/wwwroot/donpay
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run prisma:generate
npm --prefix backend run build
npm --prefix frontend run build
```

### 8) Migrasi database

```bash
cd /www/wwwroot/donpay
npm --prefix backend run prisma:migrate
```

### 9) Jalankan dengan PM2

```bash
cd /www/wwwroot/donpay
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Jalankan perintah yang ditampilkan oleh `pm2 startup` (biasanya diminta copy 1 command tambahan).

## Reverse Proxy di aaPanel
- Domain frontend -> `127.0.0.1:3000`
- Domain backend -> `127.0.0.1:3001`
- Aktifkan SSL Let’s Encrypt di dua domain

Contoh mapping umum:
- `app.domainkamu.com` -> `127.0.0.1:3000`
- `api.domainkamu.com` -> `127.0.0.1:3001`

## Command Harian PM2

```bash
pm2 list
pm2 logs
pm2 logs donpay-backend
pm2 logs donpay-frontend
pm2 restart donpay-backend
pm2 restart donpay-frontend
pm2 restart all
```

## Update Aplikasi di Terminal

### Update semua (backend + frontend)

```bash
cd /www/wwwroot/donpay
git fetch origin
git checkout main
git pull origin main
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run prisma:generate
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix backend run prisma:migrate
pm2 restart all
pm2 save
```

### Update backend saja

```bash
cd /www/wwwroot/donpay
git pull origin main
npm --prefix backend install
npm --prefix backend run prisma:generate
npm --prefix backend run build
npm --prefix backend run prisma:migrate
pm2 restart donpay-backend
```

### Update frontend saja

```bash
cd /www/wwwroot/donpay
git pull origin main
npm --prefix frontend install
npm --prefix frontend run build
pm2 restart donpay-frontend
```

## Rollback Cepat

```bash
cd /www/wwwroot/donpay
git log --oneline -n 10
git checkout <commit_stabil>
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run build
npm --prefix frontend run build
pm2 restart all
```

> Catatan: setelah `git checkout <commit_stabil>`, branch akan masuk mode detached HEAD. Jika sudah stabil, bisa buat branch baru atau checkout lagi ke `main` saat ingin update normal.

## Backup Database

```bash
mysqldump -udonpay -p donpay > /root/backup-donpay-$(date +%F-%H%M).sql
```

## Checklist Production
- Gunakan secret JWT kuat dan berbeda
- Gunakan password DB kuat
- Matikan login root MySQL remote
- Pasang firewall (buka 80/443 saja untuk publik)
- Aktifkan backup terjadwal database

## Troubleshooting Singkat

### PM2 app tidak jalan
```bash
pm2 logs donpay-backend --lines 100
pm2 logs donpay-frontend --lines 100
```

### Build frontend gagal
```bash
cd /www/wwwroot/donpay
npm --prefix frontend install
npm --prefix frontend run build
```

### Backend gagal konek MySQL
- Cek `DATABASE_URL` di `backend/.env`
- Pastikan user DB dan password sama persis dengan MySQL
- Coba login manual:

```bash
mysql -udonpay -p
```
