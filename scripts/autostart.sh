script_dir=$(dirname "$0")
lxterminal --working-directory="$script_dir/../" -e "bash -c 'node server.js';bash"

sleep 5s

if command -v chromium > /dev/null
then
  chromium --kiosk --touch-events http://localhost:5000
else
  chromium-browser --kiosk --touch-events http://localhost:5000
fi
