module.exports = function(callback) {
  if (process.env.NODE_ENV === 'test') return callback();

  const QUEUES = ['scraper'];

  var resque = require("node-resque");

  var connectionDetails = {
    host:      '127.0.0.1',
    password:  "",
    port:      6379,
    namespace: 'podcaster:resque'
  }

  var myPlugin = function(worker, func, queue, job, args, options){
    var self = this;
    self.name = 'myPlugin';
    self.worker = worker;
    self.queue = queue;
    self.func = func;
    self.job = job;
    self.args = args;
    self.options = options;
  }

  var jobs = {
    "add": {
      plugins: [ myPlugin ],
      pluginOptions: {
        myPlugin: { thing: 'stuff' },
      },
      perform: function(a,b,callback){
        var answer = a + b;
        callback(null, answer);
      },
    },
  }

//  var worker = new resque.worker({connection: connectionDetails, queues: QUEUES},
//    jobs, function(){
//      worker.workerCleanup(); // optional: cleanup any previous improperly shutdown workers
//      worker.start();
//  });
//
//  var scheduler = new resque.scheduler({connection: connectionDetails}, function(){
//    scheduler.start();
//  });

//  worker.on('start',           function(){ console.log("worker started"); })
//  worker.on('end',             function(){ console.log("worker ended"); })
//  worker.on('cleaning_worker', function(worker, pid){ console.log("cleaning old worker " + worker); })
//  worker.on('poll',            function(queue){ console.log("worker polling " + queue); })
//  worker.on('job',             function(queue, job){ console.log("working job " + queue + " " + JSON.stringify(job)); })
//  worker.on('reEnqueue',       function(queue, job, plugin){ console.log("reEnqueue job (" + plugin + ") " + queue + " " + JSON.stringify(job)); })
//  worker.on('success',         function(queue, job, result){ console.log("job success " + queue + " " + JSON.stringify(job) + " >> " + result); })
//  worker.on('failure',         function(queue, job, failure){ console.log("job failure " + queue + " " + JSON.stringify(job) + " >> " + result); })
//  worker.on('error',           function(queue, job, error){ console.log("error " + queue + " " + JSON.stringify(job) + " >> " + error); })
//  worker.on('pause',           function(){ console.log("worker paused"); })

//  scheduler.on('start',             function(){ console.log("scheduler started"); })
//  scheduler.on('end',               function(){ console.log("scheduler ended"); })
//  scheduler.on('error',             function(error){ console.log("scheduler error >> " + error); })

  var queue = new resque.queue({connection: connectionDetails}, jobs, function(){
    queue.enqueue('math', "add", [1,2]);
    queue.enqueue('math', "add", [2,3]);
    queue.enqueueIn(3000, 'math', "subtract", [2,1]);
  });
}