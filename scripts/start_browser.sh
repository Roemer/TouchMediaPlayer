#!/bin/bash

if command -v chromium > /dev/null
then
  chromium --touch-events http://localhost:5000
else
  chromium-browser --touch-events http://localhost:5000
fi
