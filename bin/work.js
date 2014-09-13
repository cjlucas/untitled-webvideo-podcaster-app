#!/usr/bin/env node

var kue = require('kue');
var jobs = kue.createQueue({
  prefix: process.env.REDIS_PREFIX || 'podcaster',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    auth: process.env.REDIS_AUTH
  }
});

var FeedParserWorker = require('../workers/feed-parser-worker');

var apiHost = process.env.API_HOST || '127.0.0.1';
var apiPort = process.env.API_PORT || 1337;
var apiToken = process.env.API_TOKEN;

jobs.process('feed parser', 1, function(job, done) {
  console.log('got a job');
  var feedId = job.data.id;
  var feedUrl = job.data.url;
  new FeedParserWorker(apiHost, apiPort, apiToken, feedId, feedUrl).work(job, done);
});