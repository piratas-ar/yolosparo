'use strict';

var Crawler = require('simplecrawler');
var _url = require('url');
var cheerio = require('cheerio');
var _ = require('lodash');
var models = require('./model');
var fs = require('fs'),
  request = require('request');
var template = require('es6-template-strings');

crawler.userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0';
crawler.maxDepth = 1;
crawler.domainWhitelist = [conf.meta.domain];
crawler.interval = 100; // 1 second
crawler.maxConcurrency = 20;

crawler.on('fetchcomplete', function(queueItem, data) {
  let url = decodeURIComponent(queueItem.url);

  try {
    var $ = cheerio.load(data);
	$('#carousel-senadores').each();
  } catch(e) {
    console.log(`${url}: ${e}`);
  }
});
let cache = {};
/*
crawler.discoverResources = function(buffer, queueItem) {
  var $ = cheerio.load(buffer.toString('utf8'));
};
*/
crawler.cache = new Crawler.cache('cache');

crawler.initialPath = '/';
crawler.queue.add('http', '80', 'www.senado.gov.ar');
crawler.start();
