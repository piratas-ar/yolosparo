var extend = require("extend");
var async = require("async");
var path = require("path");
var fs = require("fs");
var mv = require("mv");

function nombre_a_path(where, nombre, extension) {
  nombre = nombre.replace(/[^a-z0-9]/gi, '_')
  nombre = nombre.replace(/[_]+/gi, '_').toLowerCase();
  return path.resolve(where + nombre + extension);
}

module.exports = function (domain, app) {
  var campaign = app.get("name");

  // Renders the home page.
  app.post('/adherir', function (req, res, next) {
    var supportRepo = new domain
      .SupportRepository(campaign, req.db);

    // Guardar logo req.params('logo')
    var tempPath = req.files.logo.path,
        ext = path.extname(req.files.logo.name).toLowerCase(),
        targetPath = nombre_a_path('./uploads/', req.param('nombre'), ext);

    if ( ['.png','.jpg'].indexOf(ext) != -1 ) {
        mv(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
        });
    }

    var support = {
      nombre: req.param('nombre'),
      email: req.param('email'),
      logo_url: '',
      sitio: req.param('sitio'),
      adhesion: req.param('adhesion'),
      mensaje: req.param('mensaje')
    }

    supportRepo.save(support, function (err, result) {
      if (err) {
        req.db.rollback();
        res.send(500, { error: err });
      } else {
        supportRepo.get(result.id, function (err, newSupport) {
          if (err) {
            res.send(500, { error: err });
          } else {
            res.redirect('/' + campaign + '/gracias');
          }
        });
      }
    });
  });
};
