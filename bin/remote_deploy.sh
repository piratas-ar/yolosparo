#!/bin/bash

VERSION=$1
ENV=$2
FILE="yolosparo-$VERSION.tgz"
ENV_FILE="env_vars_$ENV.sh"

if [ "$VERSION" == "" ]; then
  echo "Version must be specified"
  exit 1
fi

if [ "$ENV" == "" ]; then
  echo "Environment must be specified"
  exit 1
fi

echo
echo "=== Remote deployment ($ENV) - yolosparo-$VERSION ==="
echo

if [ ! -f $ENV_FILE ]; then
  echo "Environment configuration file not found: $ENV_FILE"
  exit 1
fi

source $ENV_FILE

APP_DIR=$SERVER_DIR/yolosparo

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

echo "2. Preparing backup (it may take a while)"

if [ -d $APP_DIR ]; then
  echo -e "\tCompressing old directory $APP_DIR"

  sudo tar cfz $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-$ENV.tar.gz $APP_DIR
  sudo rm -rf $APP_DIR
fi

DB_BACKUP=$BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-$ENV.sql.gz

echo -e "\tDumping database"
sudo sh -c "mysqldump -p$DB_PASSWD -u$DB_USER $DB_NAME | gzip > $DB_BACKUP"

echo "3. Installing new version $VERSION"

sudo tar xfz $FILE -C $SERVER_DIR

cd $APP_DIR
sudo npm install --silent --unsafe-perm
sudo chown -R $APP_USER:$APP_GROUP .

