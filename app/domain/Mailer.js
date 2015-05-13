
module.exports = function (config) {

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

  /** Default logger. */
  var debug = require("debug")("Mailer");

  /** Handlebars template engine
   * @type {Object}
   * @private
   * @fieldOf Mailer#
   */
  var Handlebars = require("handlebars");

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
    host: config.mail.host,
    secureConnection: true,
    ignoreTLS: false,
    xMailer: false,
    tls: {rejectUnauthorized: false},
    auth: {
      user: config.mail.user,
      pass: config.mail.passwd
    }
  });

  /** Utility to send emails in plain text and HTML formats.
   * In debug mode, it prints the email object to the console.
   *
   * @param {String} templatePath Path where email templates are stored. Cannot
   *    be null or empty.
   */
  return function Mailer(module, templatePath) {

    /** Reads and expands the email template in the specified format.
     * @param {String} format Template format, must be a file extension. Cannot
     *    be null or empty.
     * @param {Object} data Data to expand the email template. Cannot be null.
     * @private
     * @methodOf Mailer#
     */
    var readTemplate = function (format, data) {
      var templateFile = templatePath + "." + format.toLowerCase();
      var source;
      var template;

      debug("loading email template: %s", templateFile);

      source = fs.readFileSync(templateFile).toString();
      template = Handlebars.compile(source);

      return template(data);
    };

    return {

      /** Sends an email using the configured template.
       *
       * @param {String} subject Mail subject. Cannot be null or empty.
       * @param {String} from Email sender. Cannot be null.
       * @param {String|String[]} recipients Comma-separated or array of valid
       *    email addresses. Cannot be null.
       * @param {Object} data Data to expand the template. Cannot be null.
       * @param {Function} callback Callback invoked when the mail is successfully
       *    sent. It receives an error and the response status as parameters.
       */
      send: function (subject, from, recipients, data, callback) {
        var mailOptions = {
          subject: subject,
          from: from,
          to: recipients,
          text: readTemplate("txt", data),
          html: readTemplate("html", data)
        };

        if (module.isDebugMode()) {
          debug("sending fake email: %s", JSON.stringify(mailOptions));
          setImmediate(callback);
        } else {
          debug("sending email: %s", JSON.stringify(mailOptions));
          transport.sendMail(mailOptions, callback);
        }
      }
    };
  };
};
