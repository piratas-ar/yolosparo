var http = require("http");
var path = require("path");
var express = require('express');
var app = express();
var exphbs  = require('express3-handlebars');

// General configuration.
app.configure(function() {
  app.engine('html', exphbs({ defaultLayout: 'main.html' }));
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "handlebars");

  app.use("/", express.static(__dirname + '/views/assets'));

  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
});

app.get('/', function(req, res){
  res.render("index.html");
});

app.listen(3000);

console.log("App available at http://localhost:3000");

