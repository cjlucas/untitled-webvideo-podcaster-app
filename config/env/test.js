module.exports = {
  models: {
    connection: 'memoryDb'
  },

  log: {
    level: 'silent'
  },

  redis: {
    prefix: 'podcaster-test',
    host: '127.0.0.1',
    port: 6379,
  }
}