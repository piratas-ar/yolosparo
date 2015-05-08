# Deployment instructions

*yolosparo* deployment instructions.

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

