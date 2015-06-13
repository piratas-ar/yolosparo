yolosparo
=========

Campaña para parar la ley de hidrocarburos que promueve el fracking en Argentina

## Requirements

* MySQL 5

## Installation

```
$ npm install
$ node index.js

App available at http://localhost:3000
```

The application uses *express.js 3.5* as the web framework and *handlebars* as
the template engine.

### Set up database

Before running the app you need to set up the database. Open your mysql client
and execute the following statements:

```
  create database yolosparo_dev;
  grant all privileges on yolosparo_dev.*
    to 'yolosparo'@'localhost'
    identified by 'yolosparo';
```
