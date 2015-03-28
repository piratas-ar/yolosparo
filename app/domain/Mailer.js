/** Node mailer library.
 * @type {Object}
 * @private
 * @fieldOf Mailer#
 */
var nodemailer = require("nodemailer");

/** Transport to send emails. It is here to reuse the connection pool for
 * different requests.
 *
 * @type {Object}
 * @private
 * @fieldOf Mailer#
 */
var transport = nodemailer.createTransport({
  host: app.config.mail.host,
  secureConnection: true,
  ignoreTLS: false,
  xMailer: false,
  tls: {rejectUnauthorized: false},
  auth: {
    user: app.config.mail.user,
    pass: app.config.mail.passwd
  }
});

/** Utility to send emails in plain text and HTML formats.
 * In debug mode, it prints the email object to the console.
 *
 * @param {String} templatePath Path where email templates are stored. Cannot
 *    be null or empty.
 */
module.exports = function Mailer(templatePath) {

  /** Node File System API.
   * @type {Object}
   * @private
   * @fieldOf Mailer#
   */
  var fs = require("fs");

  /** Node Path API.
   * @type {Object}
   * @private
   * @fieldOf Mailer#
   */
  var path = require("path");

  /** Handlebars template engine
   * @type {Object}
   * @private
   * @fieldOf Mailer#
   */
  var Handlebars = require("handlebars");

  /** Reads and expands the email template in the specified format.
   * @param {String} format Template format, must be a file extension. Cannot
   *    be null or empty.
   * @param {Object} data Data to expand the email template. Cannot be null.
   * @private
   * @methodOf Mailer#
   */
  var readTemplate = function (format, data) {
    var source = fs.readFileSync(templatePath + "." + format.toLowerCase());
    var template = Handlebars.compile(source.toString());
    return template(data);
  };

  return {

    /** Sends an email using the configured template.
     *
     * @param {String} from Email sender. Cannot be null.
     * @param {String|String[]} recipients Comma-separated or array of valid
     *    email addresses. Cannot be null.
     * @param {Object} data Data to expand the template. Cannot be null.
     * @param {Function} callback Callback invoked when the mail is successfully
     *    sent. It receives an error and the response status as parameters.
     */
    send: function (from, recipients, data, callback) {
      var mailOptions = {
        subject: app.config.mail.subject,
        from: from,
        to: recipients,
        text: readTemplate("txt", data),
        html: readTemplate("html", data)
      };

      if (app.config.debugMode) {
        console.log(mailOptions);
        setImmediate(callback);
      } else if (app.get("env") === "testing") {
        mailOptions.to = [app.config.mail.testRecipient];
        console.log(mailOptions);
        transport.sendMail(mailOptions, callback);
      } else {
        transport.sendMail(mailOptions, callback);
      }
    }
  };
};
