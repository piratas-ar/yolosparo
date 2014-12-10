// nombre,bloque,email,foto,twitter,facebook,url_sitio,phone,dirección,nombre de secretarix,teléfono de secretarix

var FULL_NAME = 0;
var BLOCK = 1;
var EMAIL = 2;
var PICTURE = 3;
var TWITTER_ACCOUNT = 4;
var FACEBOOK_ACCOUNT = 5;
var SITE_URL = 6;
var PHONE = 7;
var PERSONAL_ADDRESS = 8;
var SECRETARY_NAME = 9;
var SECRETARY_PHONE = 10;
var PERSONAL_PHONE = 11;

var fs = require("fs");
var parse = require('csv-parse');

var inputFile = process.argv[2];
var region = process.argv[3];
var csv = fs.readFileSync(inputFile).toString();

parse(csv, function (err, items) {
  var legislatives = items.map(function (data) {
    var email = data[EMAIL] && data[EMAIL].trim();
    var userName = email && email.substr(0, email.indexOf("@"));

    return {
      user_name: userName,
      full_name: data[FULL_NAME].trim(),
      region: region,
      block: data[BLOCK] && data[BLOCK].trim(),
      email: email,
      picture_url: data[PICTURE] && data[PICTURE].trim(),
      twitter_account: data[TWITTER_ACCOUNT] && data[TWITTER_ACCOUNT].trim(),
      facebook_account: data[FACEBOOK_ACCOUNT] && data[FACEBOOK_ACCOUNT].trim(),
      site_url: data[SITE_URL] && data[SITE_URL].trim(),
      personal_phone: data[PHONE] && data[PHONE].trim(),
      personal_address: data[PERSONAL_ADDRESS] && data[PERSONAL_ADDRESS].trim(),
      secretary_name: data[SECRETARY_NAME] && data[SECRETARY_NAME].trim(),
      secretary_phone: data[SECRETARY_PHONE] && data[SECRETARY_PHONE].trim()
    };
  });
  console.log(JSON.stringify(legislatives));
});
