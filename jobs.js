const JOBS_DIR = __dirname + "/app/jobs";

var fs = require("fs");
var path = require("path");
var jobFiles = fs.readdirSync(path.normalize(JOBS_DIR));
var CronJob = require('cron').CronJob;

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

jobFiles.forEach(file => {
  var cronConfig = require(path.join(JOBS_DIR, file));
  var job = new CronJob(Object.assign({
    timezone: "America/Argentina/Buenos_Aires",
    start: true
  }, cronConfig));
  cronConfig.onTick();
});
