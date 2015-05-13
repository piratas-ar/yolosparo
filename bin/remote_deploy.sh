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

  sudo rm -rf $APP_DIR/node_modules
  sudo tar cfz $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-$ENV.tar.gz $APP_DIR
  sudo rm -rf $APP_DIR
fi

DB_BACKUP=$BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-$ENV.sql.gz

echo -e "\tDumping database"
sudo sh -c "mysqldump -p$DB_PASSWD -u$DB_USER $DB_NAME | gzip > $DB_BACKUP"

echo "3. Installing new version $VERSION"

echo -e "\tUncompressing"
sudo tar xfz $FILE -C $SERVER_DIR

echo -e "\tGenerating service script"

sudo cat > ~/init.sh << EOF
  #!/bin/sh
  # chkconfig: 2345 95 20
  # description: $APP_USER
  # processname: node
  export NODE_CONFIG_DIR=$NODE_CONFIG_DIR
  export NODE_ENV=$ENV
  export NODE_USER=$APP_USER
  export DEBUG=bootstrap

  forever "\$@" -a -l $NODE_LOG_FILE $APP_DIR/index.js
EOF

sudo mv ~/init.sh $APP_DIR/init.sh
sudo chmod +x $APP_DIR/init.sh

echo -e "\tInstalling dependencies"
cd $APP_DIR
sudo npm install --silent --unsafe-perm
sudo chown -R $APP_USER:$APP_GROUP $APP_DIR

echo
echo -e "\tRestarting process"

sudo $APP_DIR/init.sh stop
sudo $APP_DIR/init.sh start

echo "Success."
