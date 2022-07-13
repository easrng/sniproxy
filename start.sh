#!/bin/bash
set -eu
yes '' | openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -sha256 -days 1 -nodes >/dev/null 2>&1
node index.js &
NODEPID="$!"
sleep 1
rm cert.pem key.pem
wait "$NODEPID"
