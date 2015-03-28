module.exports = function AppConfigurer(app, config) {

  /** Handlebars view renderer.
   * @type {Object}
   */
  var exphbs = require('express-handlebars');

  /** Express.js framework.
   * @type {Object}
   */
  var express = require("express");

  /** Utility to create mixins.
   * @type {Function}
   */
  var extend = require("extend");

  /** Transactions middleware.
   * @type {Function}
   */
  var transactionMiddleware = require("../lib/transactionMiddleware");

  /** Manages anonymous users.
   * @type {Function}
   */
  var userMiddleware = require("../app/userMiddleware");

  return {
    configure: function () {
      // General configuration.
      app.engine('html', exphbs({
        defaultLayout: 'main.html',
        helpers: require("./viewHelpers.js")(app)
      }));
      app.set("views", config.viewsPath);
      app.set("view engine", "handlebars");
      app.set("dataSource", config.dataSource);
      app.set("name", config.name);
      // TODO(seykron): remove when express is updated to 4.x
      app.set("mountpath", config.mountPath);

      // General purpose middlewares.
      app.use(require('express-domain-middleware'));
      app.use(express.methodOverride());
      app.use(express.bodyParser());
      app.use(express.cookieParser());
      //app.use(app.router);

      // Static resources.
      app.use("/", express.static(config.assetsPath));

      // Application-specific middlewares.
      app.use(transactionMiddleware(app));
      app.use(userMiddleware(app));

      app.locals = {
        config: extend({}, config, {
          tweet: encodeURIComponent(config.tweet)
        }),
        // Keeps compatibility with express API.
        mountpath: config.mountPath,
        menuItems: [{
          text: "Inicio",
          url: "/"
        }]
      };
    }
  };
};
