mkdir ~/.config/autostart
echo "[Desktop Entry]" >>  ~/.config/autostart/mediaplayer.desktop
echo "Type=Application" >>  ~/.config/autostart/mediaplayer.desktop
echo "Name=MediaPlayer" >>  ~/.config/autostart/mediaplayer.desktop
echo "Exec=/bin/bash \"$HOME/Desktop/TouchMediaPlayer/scripts/autostart.sh\"" >>  ~/.config/autostart/mediaplayer.desktop
