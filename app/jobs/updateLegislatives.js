process.env.DEBUG=(process.env.DEBUG || "") + ",update_legislatives,runner,people_importer," +
"mysql_data_provider,json_data_provider";

var debug = require("debug")("update_legislatives");
var ogi = require("ogov-importer");
var fs = require("fs");
var config = require("config");

var DataSource = require("../../lib/DataSource");
var dataSource = new DataSource(config.get("dataSource"));

var dataProviders = [new ogi.MySqlDataProvider({
  query: "select * from legislatives",
  dataSource: {
    server: "localhost",
    user: "yolosparo",
    password: "yolosparo",
    database: "yolosparo_dev"
  }
}), new ogi.JsonFileDataProvider({
  files: ["sql/legisladores-AR.json", "sql/legisladores-AR-B.json"]
})];

var transformer = new ogi.Transformer(dataProviders, "email", legislative => ({
  id: legislative.id,
  role: legislative.type,
  name: legislative.full_name,
  user: legislative.user_name,
  friendlyName: legislative.friendly_name || legislative.full_name,
  email: legislative.email,
  pictureUrl: legislative.picture_url,
  district: legislative.district,
  start: Date.parse(legislative.start_date),
  end: Date.parse(legislative.end_date),
  party: legislative.party,
  block: legislative.block,
  phone: legislative.phone,
  address: legislative.address,
  personalPhone: legislative.personal_phone,
  personalAddress: legislative.personal_address,
  secretary: legislative.secretary_name,
  secretaryPhone: legislative.secretary_phone,
  siteUrl: legislative.site_url,
  twitterName: legislative.twitter_account,
  facebookName: legislative.facebook_account,
  jurisdiction: legislative.region
}));
var storer = new ogi.InMemoryStorer(true, transformer);
var runner = new ogi.Runner({
  cacheDir: __dirname + "/../../data/cache",
  importers: {
    people: {
      encoding: "utf8"
    }
  },
  createStorers() {
    return [storer];
  }
}, Object.assign(ogi.arguments(process.argv), {
  cacheEnabled: true
}));

var insertOrUpdate = function (conn, items) {
  return new Promise((resolve, reject) => {
    var query = dataSource.query.insertOrUpdate("legislatives", items.map(item => ({
      id: item.id,
      user_name: item.user,
      full_name: item.name,
      email: item.email,
      picture_url: item.pictureUrl,
      district: item.district,
      start_date: item.start,
      end_date: item.end,
      block: item.block,
      phone: item.phone,
      address: item.address,
      personal_phone: item.personalPhone,
      personal_address: item.personalAddress,
      secretary_name: item.secretary,
      secretary_phone: item.secretaryPhone,
      site_url: item.siteUrl,
      twitter_account: item.twitterName,
      facebook_account: item.facebookName,
      region: item.jurisdiction,
      type: item.role
    })));

    debug("updating database");

    conn.query(query, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

var run = function () {
  debug("starting import process at %s", new Date());

  transformer.load()
    .then(() => new Promise((resolve, reject) => {
      dataSource.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    }))
    .then(conn => runner.run("people")
      .then(() => {
        debug("%s items imported", storer.getNumberOfItems());
        return insertOrUpdate(conn, storer.getItems());
      })
      .then(() => {
        return dataSource.execFile(conn, "300-campaigns-legislatives.sql");
      })
      .then(() => {
        debug("importer finished without errors at %s", new Date());
        transformer.close();
        dataSource.close();
      })
    )
    .catch(err => {
      debug("importer finished with errors: %s", err.stack || JSON.stringify(err));
      transformer.close();
      dataSource.close();
    });
};

// Runs everyday at 3am AR time.
module.exports = {
  cronTime: "00 00 03 * * *",
  onTick: run
};
