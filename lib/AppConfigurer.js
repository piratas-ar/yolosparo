module.exports = function AppConfigurer(app, config) {

  /** Node's path API. */
  var path = require("path");

  /** Directory to configure views in express. */
  var VIEWS_DIR = config.viewsPath || path.join(config.path, "views");

  /** Directory to configure static resources in express. */
  var ASSETS_DIR = config.assetsPath || path.join(config.path, "assets");

  /** Directory where render engines will look for layout templates. */
  var LAYOUTS_DIR = config.layoutsDir || path.join(VIEWS_DIR, "layouts");

  /** Directory where render engines will look for partials templates. */
  var PARTIALS_DIR = config.partialsDir || path.join(VIEWS_DIR, "partials");

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
  var transactionMiddleware = require("../app/helpers/transactionMiddleware");

  /** Manages anonymous users.
   * @type {Function}
   */
  var userMiddleware = require("../app/helpers/userMiddleware");

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
        helpers: require("../app/helpers/viewHelpers.js")(app),
        layoutsDir: LAYOUTS_DIR,
        partialsDir: PARTIALS_DIR
      }));
      app.engine('markdown', new RenderEngine({
        defaultLayout: 'main.html',
        layoutsDir: LAYOUTS_DIR,
        partialsDir: PARTIALS_DIR,
        type: "markdown"
      }));

      app.set("views", VIEWS_DIR);
      app.set("view engine", "handlebars");
      app.set("layoutsDir", LAYOUTS_DIR);
      app.set("partialsDir", PARTIALS_DIR);
      app.set("domain", config.domain);
      app.set("name", config.name);
      // TODO(seykron): remove when express is updated to 4.x
      app.set("mountpath", config.mountPath);

      if (config.dataSource) {
        app.set("dataSource", config.dataSource);
      }

      // General purpose middlewares.
      app.use(require('express-domain-middleware'));
      app.use(express.methodOverride());
      app.use(express.bodyParser());
      app.use(express.cookieParser());

      // Static resources.
      app.use("/", express.static(ASSETS_DIR));

      // Application-specific middlewares.
      app.use(transactionMiddleware(config.domain || app.get("domain"), app));
      app.use(userMiddleware(config.domain || app.get("domain"), app));

      app.config = require("config");

      app.locals = {
        config: extend({}, config, app.config, {
          tweet: encodeURIComponent(app.config.get("tweet"))
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
