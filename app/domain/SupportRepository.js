module.exports = function SupportRepository(campaign, conn) {
  /* Listar adhesiones */
  var LIST_ALL = "select s.* from support s " +
    "inner join campaigns c on s.campaign_id = c.id " +
    "where c.name = ? order by a.creation_time desc limit 300";


  /* Traer por id */
  var GET_BY_ID = "select s.* from support s " +
    "inner join campaigns c on s.campaign_id = c.id " +
    "where c.name = ? and a.id = ?";

  /* Crea adhesion */
  var SAVE_QUERY = "insert into support (creation_time, campaign_id, " +
    "nombre, email. logo, sitio, adhesion, mensaje) values (now(), " +
    "(select id from campaigns where name = ?), ?, ?, ?, ?, ?, ?)";

  var createSupport = function (result) {
    var support = result.s;

    return support;
  };

  return {

    /** Lists all supports.
     *
     * @param {Function} callback Receives an error and the list of supports
     *    as parameters. Cannot be null.
     */
    list: function (callback) {
      conn.query({
        sql: LIST_ALL,
        nestTables: true
      }, [campaign], function (err, results) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, results.map(createSupport));
      });
    },

    /** Searches for support by id.
     * @param {String} id Required support id. Cannot be null.
     * @param {Function} callback Receives an error and the required support
     * as
     *    parameters. Cannot be null.
     */
    get: function (id, callback) {
      conn.query({
        sql: GET_BY_ID,
        nestTables: true
      }, [campaign, id], function (err, results) {
        if (err) {
          callback(err);
          return;
        }
        if (results.length) {
          callback(null, createSupport(results.shift()));
        } else {
          callback();
        }
      });
    },

    /** Creates a support.
     * @param {Object} support Support to create. Cannot be null.
     * @param {Function} callback Receives an error and the support instance
     *    as parameters. Cannot be null.
     */
    save: function (support, callback) {
      conn.query(SAVE_QUERY, [ campaign, support.nombre, support.email, support.logo_url, support.sitio, support.adhesion, support.mensaje ], function (err, result) {
        if (err) {
          callback(err);
          return;
        }
        support.id = result.insertId;
        callback(null, activity);
      });
    }
  }

};
