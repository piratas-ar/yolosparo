/** View helpers for the specified express application.
 * @param {Object} app Express application. Cannot be null.
 */
module.exports = function (app) {

  /** Node's file system API. */
  var fs = require("fs");

  /** Node's path API. */
  var path = require("path");

  /** Utility to parse markdown. */
  var marked = require("marked");

  return {

    /** Converts an object to the JSON string representation.
     * @param {Object} object Object to convert. Cannot be null.
     * @return {String} a valid JSON string, never null.
     */
    json: function (object) {
      return JSON.stringify(object);
    },

    /** Applies URI encode to a String
     * @param {Object} object String to encode. Cannot be null.
     * @return {String} the encoded string, never null.
     */
    encodeUri: function (object) {
      return encodeURIComponent(object);
    },

    /** Includes a content file, it could be either a text or markdown file.
     * @param {String} file File to include, relative to the views directory.
     *    Cannot be null.
     */
    content: function (file) {
      var viewsPath = this.config.viewsPath ||
        path.join(this.config.path, "views");
      var contentFile = path.join(viewsPath, file);
      var content = fs.readFileSync(contentFile).toString();
      var extension = file.substr(file.lastIndexOf(".") + 1);

      if (extension === "md" || extension === "markdown") {
        content = marked(content);
      }

      return content;
    }
  };
};
