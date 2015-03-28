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

  /** Utility to create mixins.
   * @type {Function}
   * @private
   * @fieldOf CampaignLoader#
   */
  var extend = require("extend");

  /** Default logger. */
  var debug = require("debug")("CampaignLoader");

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

  /** Utility to configure the campaign application.
   * @type {Function}
   */
  var AppConfigurer = require("./AppConfigurer");

  /** Directory to load controllers from. */
  var CONTROLLERS_DIR = path.join(config.path, "controllers");

  // Constructor
  (function __init() {
    var configurer = new AppConfigurer(campaignApp, extend(app.config, config, {
      dataSource: app.get("dataSource"),
      domain: extend({}, config.domain, app.get("domain")),
      layoutsDir: app.get("layoutsDir"),
      partialsDir: app.get("partialsDir")
    }));

    configurer.configure();

    // Loads all application files.
    fs.readdir(CONTROLLERS_DIR, function (err, files) {
      if (err) {
        throw new Error("Cannot load app " + config.name + " : " + err);
      }
      files.forEach(function (file) {
        var fullPath = path.join(CONTROLLERS_DIR, file);
        var endpoint;

        if (fs.statSync(fullPath).isFile()) {
          debug("loading controller %s", file);

          endpoint = require(fullPath);
          endpoint(extend({}, app.get("domain"), config.domain), campaignApp);
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
      debug("campaign '%s' loaded at %s", config.name, config.mountPath);
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
