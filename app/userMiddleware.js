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

/** Generates a unique user name using two random names from the list.
 *
 * @param {UsersRepository} repo Repository to manage users. Cannot be null.
 * @param {Function} callback Receives an error and the new user as parameters.
 *    Cannot be null.
 */
var generateUniqueName = function (repo, callback) {
  var nick = names[randomIndex()] + " " + names[randomIndex()];

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
        nick: nick
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
  var doGenerate = function () {
    generateUniqueName(repo, function (err, user) {
      if (err) {
        next(new Error(err));
        return;
      }
      res.locals.user = user;
      res.cookie("uid", user.nick);
      next();
    });
  };

  if (req.db) {
    // Checks the user only in requests within a transaction.
    repo = new UsersRepository(req.db);

    if (req.cookies.uid) {
      repo.findByNickname(req.cookies.uid, function (err, user) {
        // Error retrieving existing user.
        if (err) {
          next(new Error(err));
        }
        if (user) {
          // User exists.
          res.locals.user = user;
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
