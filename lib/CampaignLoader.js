/** Loads an application for a single campaign.
 *
 * @param {String} config.viewsPath Path to load views. Cannot be null or empty.
 * @param {String} config.assetsPath Path to load static resources. Cannot be
 *    null or empty.
 * @param {String} config.path File system directory to load app files. Cannot
 *    be null or empty.
 * @param {String} config.mountPath Path to mount this application in the main
 *    application.
 * @constructor
 */
module.exports = function CampaignLoader(config) {

  /** Node's path API.
   * @type {Object}
   * @private
   * @fieldOf CampaignLoader#
   */
  var path = require("path");

  /** Node's file system API.
   * @type {Object}
   * @private
   * @fieldOf CampaignLoader#
   */
  var fs = require("fs");

  /** Handlebars view renderer.
   * @type {Object}
   * @private
   * @fieldOf CampaignLoader#
   */
  var exphbs = require('express-handlebars');

  /** Utility to create mixins.
   * @type {Function}
   * @private
   * @fieldOf CampaignLoader#
   */
  var extend = require("extend");

  /** Express.js framework.
   * @type {Object}
   * @private
   * @fieldOf CampaignLoader#
   */
  var express = require("express");

  /** Sub-application for this campaign.
   * @type {Object}
   * @private
   * @fieldOf CampaignLoader#
   */
  var campaignApp = express();

  /** Transactions middleware.
   * @type {Function}
   * @private
   * @fieldOf CampaignLoader#
   */
  var transactionMiddleware = require("../lib/transactionMiddleware");

  /** Manages anonymous users.
   * @type {Function}
   * @private
   * @fieldOf CampaignLoader#
   */
  var userMiddleware = require("../app/userMiddleware");

  // Constructor
  (function __init() {
    // General configuration.
    campaignApp.engine('html', exphbs({
      defaultLayout: 'main.html',
      helpers: require("./viewHelpers.js")
    }));
    campaignApp.set("views", config.viewsPath);
    campaignApp.set("view engine", "handlebars");
    campaignApp.set("dataSource", app.get("dataSource"));
    campaignApp.set("name", config.name);

    // General purpose middlewares.
    campaignApp.use(require('express-domain-middleware'));
    campaignApp.use(express.methodOverride());
    campaignApp.use(express.bodyParser());
    campaignApp.use(express.cookieParser());
    campaignApp.use(app.router);

    // Static resources.
    campaignApp.use("/", express.static(config.assetsPath));

    // Application-specific middlewares.
    campaignApp.use(transactionMiddleware(campaignApp));
    campaignApp.use(userMiddleware(campaignApp));

    campaignApp.locals = {
      config: extend({}, app.config, {
        tweet: encodeURIComponent(app.config.tweet)
      }),
      // Keeps compatibility with express API.
      mountpath: config.mountPath,
      menuItems: [{
        text: "Inicio",
        url: "/"
      }]
    };

    // Loads all application files.
    fs.readdir(config.path, function (err, files) {
      if (err) {
        throw new Error("Cannot load app " + config.name + " : " + err);
      }
      files.forEach(function (file) {
        var fullPath = path.join(config.path, file);
        var endpoint;

        if (file !== "index.js" && fs.statSync(fullPath).isFile()) {
          endpoint = require(fullPath);
          endpoint(config.domain, campaignApp);
        }
      });
    });
  }());

  return extend(campaignApp, {

    /** Mounts the campaign application into the main app.
     */
    load: function () {
      // Mounts the sub-application in the main application at the configured
      // mount point.
      app.use(config.mountPath, campaignApp);
      console.log("Campaign '" + config.name + "' loaded.");
    },

    /** Registers the campaign menu.
     *
     * @param {Object[]} menuItems List of menu items. Cannot be null.
     * @param {String} menuItems[].text Menu item text. Cannot be null or empty.
     * @param {String} menuItems[].url Url relative to the mountpath. Cannot be
     *    null or empty.
     */
    registerMenu: function (menuItems) {
      campaignApp.locals.menuItems = campaignApp.locals.menuItems
        .concat(menuItems);
    }
  });
};
