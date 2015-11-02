/** This middleware checks whether there exist a cookie named <code>uid</code>
 * and if it doesn't, it creates a new anonymous user for the current request.
 * It also checks whether the existing cookie is still a valid user or not.
 */
module.exports = function(domain, app) {

  /** Name of the campaign related to this middleware.
   * @type {String}
   * @private
   */
  var campaign = app.get("name");

  /** Node's file system API.
   */
  var fs = require("fs");

  /** Node's path API.
   */
  var path = require("path");

  /** Node's crypto API.
   */
  var crypto = require("crypto");

  /** Default logger. */
  var debug = require("debug")("userMiddleware");

  /** List of available names to generate anonymous user names.
   */
  var names = fs.readFileSync(path.join(__dirname, "names.txt")).toString()
    .split("\n");

  /** Generates a random number between 0 and the number of names, using the
   * current time as an additional seed.
   * @return {Number} Returns a valid index, never null.
   */
  var randomIndex = function () {
    return Math.floor((Math.random() * Date.now()) % names.length);
  };

  /** Generates a unique key for the specified user.
   * @param {Object} user User to generate secret. Cannot be null.
   * @return {String} A SHA-1 hash, never null or empty.
   */
  var generateSecret = function (nick) {
    var sha = crypto.createHash('sha1');
    sha.update(nick);
    sha.update(String(Date.now()));
    return sha.digest("hex");
  };

  /** Generates a unique user name using two random names from the list.
   *
   * @param {UsersRepository} repo Repository to manage users. Cannot be null.
   * @param {Function} callback Receives an error and the new user as parameters.
   *    Cannot be null.
   */
  var generateUniqueName = function (repo, callback) {
    var number = String(Date.now());
    var nick = names[randomIndex()] + number.substr(-4, 3);
    nick = nick.charAt(0).toUpperCase() + nick.slice(1);

    repo.findByNickname(campaign, nick, function (err, user) {
      if (err) {
        callback(err);
        return;
      }
      if (user) {
        generateUniqueName(repo, callback);
      } else {
        repo.save(campaign, {
          nick: nick,
          secret: generateSecret(nick)
        }, callback);
      }
    });
  };

  (function __initialize() {
    debug("registering userMiddleware for application: " + app.get("name"));
  }());

  return function userMiddleware(req, res, next) {
    var repo;
    var uid = req.param("uid") || req.cookies.uid;
    var secret = req.param("ukey") || req.cookies.ukey;
    var currentCampaign = req.param("campaign") || campaign;
    var setCookie = function (name, value) {
      var options = {
        path: app.get("mountpath")
      };
      if (!app.locals.config.debugMode) {
        options.maxAge = 157680000000;
      }
      res.cookie(name, value, options);
    };
    var doGenerate = function () {
      generateUniqueName(repo, function (err, user) {
        if (err) {
          next(new Error(err));
          return;
        }
        req.user = user;
        res.locals.user = user;
        res.locals.campaign = campaign;

        setCookie("uid", user.nick);
        setCookie("ukey", user.secret);

        debug("[%s]|%s|%s %s", user.nick, currentCampaign, req.method, req.url);

        next();
      });
    };

    // Excludes the main app.
    if (req.db) {

      // Checks the user only in requests within a transaction.
      repo = new domain.UsersRepository(req.db);

      if (uid && secret) {
        repo.findByNicknameAndSecret(currentCampaign, uid, secret,
          function (err, user) {
            // Error retrieving existing user.
            if (err) {
              next(new Error(err));
            }

            if (user) {
              // User exists.
              req.user = user;
              res.locals.user = user;
              res.locals.campaign = campaign;

              debug("%s|%s|%s %s", uid, currentCampaign, req.method, req.url);

              next();
            } else {
              // User cookies is set, but the user doesn't exist in the database.
              // Generates a new one.
              doGenerate();
            }
          });
      } else {
        // User does not exist, generates a new one.
        doGenerate();
      }
    } else {
      // Request is not within a transaction, proceeds.
      next();
    }
  };
};
