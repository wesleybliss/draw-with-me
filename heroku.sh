if [ "$DWM_FLAVOR" == "api" ]; then
    node server/src/index.js
else
    # node client/src/server.js
    cd client && ../node_modules/.bin/sabu -c sabu.conf.json
fi
