#!/usr/bin/env bash
# One-click launcher for Mac/Linux.
# Starts the backend API and the frontend static server together, then opens your browser.
#
# First-time use: make sure you have Node.js and MongoDB installed/running (or a MongoDB
# Atlas URI ready), then see README.md for the one-time `npm run seed` step.

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== Fashion & Apparel E-Commerce Platform — Launcher =="

# --- Backend ---
cd "$DIR/backend"
if [ ! -d node_modules ]; then
  echo "Installing backend dependencies (first run only)..."
  npm install
fi
if [ ! -f .env ]; then
  echo "Creating .env from .env.example — edit backend/.env with your MongoDB URI if needed."
  cp .env.example .env
fi

echo "Starting backend API on http://localhost:5000 ..."
npm run dev &
BACKEND_PID=$!

# --- Frontend ---
cd "$DIR/frontend"
echo "Starting frontend on http://localhost:5173 ..."
npx --yes serve -l 5173 . &
FRONTEND_PID=$!

sleep 3
URL="http://localhost:5173"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  echo "Open $URL in your browser."
fi

echo ""
echo "Running. Backend PID=$BACKEND_PID  Frontend PID=$FRONTEND_PID"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
