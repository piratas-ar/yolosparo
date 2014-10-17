/** Repository to manage users.
 * @type {Function}
 */
var UsersRepository = require("../lib/UsersRepository");

/** Node's file system API.
 */
var fs = require("fs");

/** Node's path API.
 */
var path = require("path");

/** Node's crypto API.
 */
var crypto = require("crypto");

/** List of available names to generate anonymous user names.
 */
var names = fs.readFileSync(path.join(__dirname, "..", "names.txt")).toString()
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
  var nick = names[randomIndex()] + number.substr(-4, 4);

  repo.findByNickname(nick, function (err, user) {
    if (err) {
      callback(err);
      return;
    }
    if (user) {
      generateUniqueName(repo, callback);
    } else {
      console.log("New user: " + nick);
      repo.save({
        nick: nick,
        secret: generateSecret(nick)
      }, callback);
    }
  });
};

/** This middleware checks whether there exist a cookie named <code>uid</code>
 * and if it doesn't, it creates a new anonymous user for the current request.
 * It also checks whether the existing cookie is still a valid user or not.
 *
 * @param {Object} req Current request. Cannot be null.
 * @param {Object} res Current response. Cannot be null.
 * @param {Function} next Continuation function.
 */
module.exports = function userMiddleware(req, res, next) {
  var repo;
  var uid = req.cookies.uid;
  var secret = req.cookies.ukey;
  var doGenerate = function () {
    generateUniqueName(repo, function (err, user) {
      if (err) {
        next(new Error(err));
        return;
      }
      res.locals.user = user;
      res.cookie("uid", user.nick);
      res.cookie("ukey", user.secret);
      next();
    });
  };
  var updateSecret = function (user) {
    var secret = generateSecret(user.nick);

    res.cookie("ukey", secret);
    repo.updateSecret(user.id, secret, function (err) {
      if (!err) {
        user.secret = secret;
      }
      next();
    });
  };

  if (req.db) {
    // Checks the user only in requests within a transaction.
    repo = new UsersRepository(req.db);

    if (uid) {
      repo.findByNicknameAndSecret(uid, secret, function (err, user) {
        // Error retrieving existing user.
        if (err) {
          next(new Error(err));
        }
        if (user) {
          // User exists.
          res.locals.user = user;

          if (req.method === "GET") {
            updateSecret(user);
          } else {
            next();
          }
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
