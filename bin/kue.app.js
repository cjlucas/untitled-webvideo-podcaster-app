var kue = require('kue');
var jobs = kue.createQueue({
  prefix: process.env.REDIS_PREFIX || 'podcaster',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    auth: process.env.REDIS_AUTH
  }
});
var port = process.env.KUE_APP_PORT || 3000;
kue.app.listen(port);
console.log('UI started on port' + port);