#!/bin/bash

VERSION=$1
FILE="yolosparo-$VERSION.tgz"

echo
echo "=== Remote deployment - yolosparo-$VERSION ==="
echo

source env_vars.sh

if [ ! -d $SERVER_DIR ]; then
  echo "Server directory not found $SERVER_DIR"
  exit 1
fi

if [ ! -d $BACKUP_DIR ]; then
  echo "Backup directory not found $BACKUP_DIR"
  exit 1
fi

if [ ! -f $FILE ]; then
  echo "Source file not found $FILE"
  exit 1
fi

echo "1. Copying new version"

sudo cp $FILE $SERVER_DIR
cd $SERVER_DIR

echo "2. Preparing backup"

if [ -d ./yolosparo ]; then
  sudo tar cfz $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-dev.tar.gz yolosparo
  sudo rm -rf yolosparo
fi

sudo mysqldump -pyolosparo -uyolosparo yolosparo_dev | \
  gzip > $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-dev.sql.gz

echo "3. Installing new version $VERSION"

sudo tar xfz $FILE
cd yolosparo
sudo npm install --silent
sudo chown -R $APP_USER:$APP_GROUP .

