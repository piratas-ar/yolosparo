/** Represents a single user in the application.
 * @param {Object} user Query resultset. Cannot be null.
 * @constructor
 */
module.exports = function User(user) {
  return {
    id: user.id,
    nick: user.nick_name,
    fullName: user.full_name,
    email: user.email,
    secret: user.secret
  };
};
