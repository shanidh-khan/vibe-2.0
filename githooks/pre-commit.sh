#!/bin/sh

echo "🔍 Running Prettier & ESLint before commit..."

# Run for client
cd web
npx prettier --write .
git add .
npx eslint . --fix
if [ $? -ne 0 ]; then
  echo "❌ ESLint failed in client/"
  exit 1
fi
cd ..

# Run for server
# cd server
# npx prettier --write .
# git add .
# npx eslint . --fix
# if [ $? -ne 0 ]; then
#   echo "❌ ESLint failed in server/"
#   exit 1
# fi
cd ..

echo "✅ Prettier & ESLint checks passed! Staging changes..."
git add .

echo "✅ All changes staged. Proceeding with commit..."