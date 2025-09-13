#!/bin/sh

# Health check script for nginx container
# This script checks if nginx is running and serving content

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "ERROR: nginx process not found"
    exit 1
fi

# Check if nginx is responding to HTTP requests
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "ERROR: nginx not responding to HTTP requests"
    exit 1
fi

echo "OK: nginx is healthy"
exit 0