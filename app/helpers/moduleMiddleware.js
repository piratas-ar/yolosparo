/** This middleware binds the <code>module</code> model attribute to the
 * current module configuration (module.json).
 */
module.exports = function (domain, app, module) {

  return function moduleMiddleware(req, res, next) {
    res.locals.module = module.getConfiguration();
    next(null);
  };
};
