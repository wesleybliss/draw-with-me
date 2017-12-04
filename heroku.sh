if [ "$DWM_FLAVOR" == "api" ]; then
    node server/src/index.js
else
    node client/src/server.js
fi
