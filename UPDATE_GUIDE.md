# Panduan Update DonPay di Terminal

## A. Update semua service (frontend + backend)
Masuk ke folder project:
```bash
cd /var/www/donpay
```

Tarik update terbaru:
```bash
git fetch origin
git checkout main
git pull origin main
```

Rebuild & restart:
```bash
docker compose up -d --build
```

Jalankan migrasi jika ada perubahan schema:
```bash
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

## B. Hanya update backend
```bash
cd /var/www/donpay
git pull origin main
docker compose build backend
docker compose up -d backend
docker compose exec -T backend npm run prisma:migrate
docker compose exec -T backend npm run prisma:generate
```

## C. Hanya update frontend
```bash
cd /var/www/donpay
git pull origin main
docker compose build frontend
docker compose up -d frontend
```

## D. Cek status setelah update
```bash
docker compose ps
docker compose logs -f --tail=100 backend
docker compose logs -f --tail=100 frontend
```

## E. Rollback cepat ke commit sebelumnya
```bash
cd /var/www/donpay
git log --oneline -n 5
git checkout <commit_yang_stabil>
docker compose up -d --build
```

Catatan:
- Jika pakai rollback commit, setelah stabil lakukan branch/release strategy supaya riwayat deploy tetap rapi.
- Backup database sebelum update besar:
```bash
docker compose exec -T mysql mysqldump -uroot -pROOT_PASSWORD donpay > backup-$(date +%F-%H%M).sql
```
