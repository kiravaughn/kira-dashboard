#!/bin/bash
set -e

cd /home/kira/kira-dashboard-v2

echo "=== Building API ==="
cd apps/api
npx prisma generate
npx nest build
cd ../..

echo "=== Building Web ==="
cd apps/web
rm -rf .next
npx next build
cd ../..

echo "=== Restarting PM2 ==="
npx pm2 restart ecosystem.config.js

echo "=== Waiting for startup ==="
sleep 5

echo "=== Health check ==="
WEB=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/)
API=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/)
echo "Web: $WEB | API: $API"

if [ "$WEB" = "200" ] && [ "$API" = "200" ]; then
  echo "=== Deploy successful ==="
else
  echo "=== DEPLOY FAILED ==="
  npx pm2 logs --lines 20 --nostream
  exit 1
fi
