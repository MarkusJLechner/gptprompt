#!/bin/bash

ngrok http 5173 --oauth google --region eu > /dev/null &2>1;

sleep 1;

url="$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')"

qrencode -t ANSI256UTF8 "$url"

echo "$url"

read -p "Press any key to kill..." -n1 -s

echo ""

kill -9 $(ps -ef | grep 'ngrok' | grep -v 'grep' | awk '{print $2}')
