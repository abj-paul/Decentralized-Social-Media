#!/bin/bash
rm backend/user-service/servers.js
rm backend/post-service/servers.js
rm backend/notification-service/servers.js


echo "Done removing old servers.js"

cp servers.js backend/user-service/
cp servers.js backend/post-service/
cp servers.js backend/notification-service/


echo "Done copying new servers.js"
