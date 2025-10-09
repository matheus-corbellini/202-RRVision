#!/bin/bash

echo "🧹 Limpando cache do Vite..."
rm -rf node_modules/.vite
rm -rf dist

echo "🔄 Reiniciando servidor de desenvolvimento..."
npm run dev
