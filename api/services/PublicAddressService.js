module.exports = {
  getPublicAddress: function() {
    var host = sails.config.publicHost || 'localhost';
    var port = sails.config.publicPort || sails.hooks.http.server.address().port;

    return {host: host, port: port};
  }
};