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

  /** Default logger. */
  var debug = require("debug")("AppConfigurer");

  /** Transactions middleware.
   * @type {Function}
   */
  var transactionMiddleware = require("../lib/transactionMiddleware");

  /** Manages anonymous users.
   * @type {Function}
   */
  var userMiddleware = require("../app/userMiddleware");

  /** Custom render engine with markdown support. */
  var RenderEngine = require("./RenderEngine.js");

  /** List of static view names. */
  var staticViews = config.staticViews || [];

  /** Maps a static view to a route with the same name.
   * @param {String} viewName Name of the view to map. Cannot be null.
   */
  var registerStaticView = function (viewName) {
    var route = viewName.substr(0, viewName.indexOf("."));

    debug("mapping static view %s to /%s", viewName, route);

    app.get("/" + route, function (req, res) {
      res.render(viewName);
    });
  };

  return {
    configure: function () {
      // General configuration.
      app.engine('html', new RenderEngine({
        defaultLayout: 'main.html',
        helpers: require("./viewHelpers.js")(app)
      }));
      app.engine('markdown', new RenderEngine({
        defaultLayout: 'main.html',
        type: "markdown"
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

      staticViews.forEach(registerStaticView);
    }
  };
};
