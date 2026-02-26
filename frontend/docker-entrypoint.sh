#!/bin/bash

if [ -n "$BACKEND_HOST" ]; then
    sed -i "s|__BACKEND_HOST__|$BACKEND_HOST|g" /etc/nginx/conf.d/default.conf
fi

nginx -g 'daemon off;'
