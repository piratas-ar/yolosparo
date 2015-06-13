/** Extends the express-handlebars render engine to support markdown.
 * @param {Object} config Config for the express-handlebars render engine.
 *    Cannot be null.
 */
module.exports = function RenderEngine(config) {

  /** Node's file system API. */
  var fs = require("fs");

  /** Markdown parser
   * @type {Function}
   */
  var marked = require("marked");

  /** Default logger. */
  var debug = require("debug")("RenderEngine");

  /** Utility to compose mixins. */
  var extend = require("extend");

  /** Handlebars render engine.
   * @type {Function}
   */
  var ExpressHandlebars = require("express-handlebars").ExpressHandlebars;

  return function (viewPath, options, callback) {
    var hbs = new ExpressHandlebars(config);

    debug("render %s", viewPath);

    if (config.type && config.type === "markdown") {

      // Parses the markdown view and send it embedded in the configured layout.
      marked(fs.readFileSync(viewPath).toString(), function (err, content) {
        var layoutPath = hbs._resolveLayoutPath(options.layout ||
          config.defaultLayout);

        debug("process markdown layout %s", layoutPath);

        if (layoutPath) {
          hbs.render(layoutPath, extend(options, {
            body: content
          }), extend(options, {
            precompiled: true
          })).then(function (body) {
            callback(null, body);
          }).catch(function (err) {
            debug("render error: %s", err);
            callback(err, null);
          });
        } else {
          callback(err, content);
        }
      });
    } else {
      hbs.engine(viewPath, options, callback);
    }
  };
};
