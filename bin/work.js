#!/usr/bin/env node

var kue = require('kue');
var jobs = kue.createQueue();
var FeedParserWorker = require('../workers/feed-parser-worker');

jobs.process('feed parser', 1, function(job, done) {
  var feedId = job.data.id;
  var feedUrl = job.data.url;
  new FeedParserWorker('localhost', 1337, feedId, feedUrl).work(job, done);
});