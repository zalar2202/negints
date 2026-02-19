#!/bin/sh

# Ensure the storage directory and its subdirectories have the correct permissions
# for the nextjs user (UID 1001)
echo "Setting permissions for /app/storage..."
mkdir -p /app/storage/blog \
         /app/storage/users/avatars \
         /app/storage/payments/receipts \
         /app/storage/documents

chown -R nextjs:nodejs /app/storage
chmod -R 755 /app/storage

echo "Starting application as nextjs..."
# Execute the main command as nextjs user
exec su-exec nextjs "$@"
