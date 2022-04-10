#!/bin/bash

script_dir=$(dirname "$0")
# Start the server in a new terminal
lxterminal -e "bash -c $script_dir/start_server.sh; bash" &
# Start the browser after a small delay
sleep 5s
bash -c "$script_dir/start_browser.sh"
