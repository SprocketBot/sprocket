#!/bin/bash
# For simplicity, this script must be run from the sprocket/core directory

if [ ! -d ./secret ]; then
    mkdir ./secret
fi

filesCoreNeeds=("db-password.txt" 
    "redis-password.txt" 
    "jwtSecret.txt" 
    "minio-access.txt" 
    "minio-secret.txt" 
    "googleClientId.txt" 
    "googleSecret.txt" 
    "discord-client.txt"
    "discord-secret.txt")

for i in ${filesCoreNeeds[@]}; do
    if [ ! -f ./secret/${i} ]; then
        echo "Creating ./secret/${i}"
        touch ./secret/${i}
        echo "emptyDataPleaseReplaceKThxBai" >> ./secret/${i}
    fi
done
