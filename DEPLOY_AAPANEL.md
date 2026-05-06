# Deploy DonPay di VPS aaPanel

## Opsi cepat (otomatis)
```bash
wget -O install.sh https://raw.githubusercontent.com/lexazor/donpay/main/install.sh
chmod +x install.sh
sudo APP_DIR=/var/www/donpay REPO_URL=https://github.com/lexazor/donpay.git BRANCH=main ./install.sh
```

Panduan manual lengkap ada di `INSTALL_MANUAL.md` dan update rutin ada di `UPDATE_GUIDE.md`.

## 1) Persiapan server
- Install `Docker` + `Docker Compose` dari App Store aaPanel.
- Buka port `3000`, `3001`, dan `3306` (atau gunakan reverse proxy domain).

## 2) Clone project
```bash
git clone <repo-url> donpay
cd donpay
```

## 3) Set environment
- `backend/.env`:
```env
PORT=3001
DATABASE_URL="mysql://root:rootpassword@mysql:3306/donpay"
JWT_SECRET="ganti-rahasia-access"
JWT_REFRESH_SECRET="ganti-rahasia-refresh"
```
- `frontend/.env`:
```env
NEXT_PUBLIC_API_URL="https://api.domainkamu.com"
```

## 4) Jalankan container
```bash
docker compose up -d --build
```

## 5) Migrasi Prisma
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate
```

## 6) Reverse proxy aaPanel
- Domain frontend -> `127.0.0.1:3000`
- Domain backend API -> `127.0.0.1:3001`

## 7) SSL
- Aktifkan Let’s Encrypt di aaPanel untuk domain frontend dan backend.

## 8) Production checklist
- Ubah semua secret JWT.
- Aktifkan backup database harian di aaPanel.
- Pasang monitoring CPU/RAM + log rotation.
- Batasi akses MySQL hanya internal container jika memungkinkan.
