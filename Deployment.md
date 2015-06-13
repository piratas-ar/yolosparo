# Deployment instructions

*yolosparo* deployment instructions.

## Requirements

* Access to the remote host via public key authentication

* All remote directories must exist

* There must be an ```env_vars.sh``` file in the remote temporary directory to
configure the deployment environment.

**${remotePath}/env_vars.sh**

```
#!/bin/bash

export BACKUP_DIR=/opt/backup/yolosparo
export SERVER_DIR=/srv/node-dev
export APP_USER=yolosparo
export APP_GROUP=node
```


1. Create the connection configuration file at ```config/secret.json```

```
{
  // Deployment host.
  "host": "yolosparo.org",

  // Temporary directory in the remote host to upload the files to deploy.
  // WARNING: it must exist.
  "remotePath": "/home/remoteuser",

  // User name in the remote host.
  "username": "remoteuser",

  //
  "privateKey": "/home/localuser/.ssh/id_rsa",
  "passphrase": null
}
```

## Development

1. Copy the compressed file to the node's root directory for development
applications and change to that directory:

```
mv yolosparo-{version}.tgz /srv/node-dev
cd /srv/node-dev/
```

2. Backup the previous directory, if any:

```
tar cfz $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-dev.tar.gz yolosparo
```

3. Backup the database, if it exists

```
mysqldump -pyolosparo -uyolosparo yolosparo_dev | \
gzip > $BACKUP_DIR/`date +%Y-%m-%d`-yolosparo-dev.sql.gz

```

4. Shutdown the application, if running

5. Remove the old directory, uncompress the new version and install dependencies

```
rm -rf yolosparo
tar xfz yolosparo-{version}.tgz
cd yolosparo
npm install
```

6. Start the application in debug mode

```
export DEBUG=userMiddleware,changeSettings,RenderEngine,CampaignLoader,\
AppConfigurer,Mailer,bootstrap,update-legislatives,DataSource

nohup forever index.js &> /srv/log/`date +%Y-%m-%d`-yolosparo-dev.log &
```

