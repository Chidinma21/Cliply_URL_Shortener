#!/bin/sh

echo "Starting Deployment Process..."

echo "Running migrations..."

migrate -path ./migrations -database "$DATABASE_URL" up || echo "Migrations skipped or already applied"

echo "Starting server..."
node src/server.js