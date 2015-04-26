module.exports = function Module(app, config) {

  /** Node's path API. */
  var path = require("path");

  /** Node's file system API.
   * @type {Object}
   */
  var fs = require("fs");

  /** Utility to create mixins.
   * @type {Function}
   */
  var extend = require("extend");

  /** Directory to configure views in express. */
  var VIEWS_DIR = config.viewsPath || path.join(config.path, "views");

  /** Directory to configure static resources in express. */
  var ASSETS_DIR = config.assetsPath || path.join(config.path, "assets");

  /** Directory where render engines will look for layout templates. */
  var LAYOUTS_DIR = config.layoutsDir || path.join(VIEWS_DIR, "layouts");

  /** Directory where render engines will look for partials templates. */
  var PARTIALS_DIR = config.partialsDir || path.join(VIEWS_DIR, "partials");

  /** Directory to load controllers from. */
  var CONTROLLERS_DIR = path.join(config.path, "controllers");

  /** Directory which contains domain entities and repositories. */
  var DOMAIN_DIR = path.join(config.path, "domain");

  var DOMAIN = (function () {
    var domain = {};

    if (fs.existsSync(DOMAIN_DIR)) {
      fs.readdirSync(DOMAIN_DIR).forEach(function (file) {
        var name = path.basename(file, ".js");

        domain[name] = require(path.join(DOMAIN_DIR, file));
      });
    }

    return extend(domain, config.domain);
  }());

  /** Handlebars view renderer.
   * @type {Object}
   */
  var exphbs = require('express-handlebars');

  /** Express.js framework.
   * @type {Object}
   */
  var express = require("express");

  /** Default logger. */
  var debug = require("debug")("Module");

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

  // Constructor method.
  (function __initialize() {
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
    app.set("domain", DOMAIN);
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
    app.use(transactionMiddleware(DOMAIN, app));
    app.use(userMiddleware(DOMAIN, app));

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
      }].concat(config.menu)
    };
  }());

  return {

    /** Loads controllers, static views, and mounts the module as a
     * sub-application of the specified express app.
     */
    load: function () {

      // Loads all controllers files.
      fs.readdirSync(CONTROLLERS_DIR).forEach(function (file) {
        var fullPath = path.join(CONTROLLERS_DIR, file);
        var endpoint;

        if (fs.statSync(fullPath).isFile()) {
          debug("loading controller %s", file);

          endpoint = require(fullPath);
          endpoint(extend({}, app.get("domain"), config.domain), app);
        }
      });

      staticViews.forEach(registerStaticView);
    },

    /** Mounts this module as a sub-application of the specified express app.
     * @param {Object} parentApp Application to mount the module. Cannot be
     *    null.
     */
    mount: function (parentApp) {
      // Mounts the sub-application at the configured mount point.
      parentApp.use(config.mountPath, app);
    },

    /** Returns the module configuration.
     * @return {Object} an object with the configuration specified in the
     *    module.json file.
     */
    getConfiguration: function () {
      return config;
    }
  };
};
