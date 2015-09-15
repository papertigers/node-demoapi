var Hapi = require('hapi');
var os = require('os');
var consul = require('consul')({"host": "consul"});

//making a lot of assumptions here
var internalip = os.networkInterfaces().eth0[0].address
var colorDeploy = process.env.COLOR || "gray"
var hostid = os.hostname();


//Setup the service in consul
var opts = {
    "name": "api",
    "ID": hostid,
    "Address": internalip,
    "Port": 80,
    "Check": {
      "HTTP": "http://" + internalip + "/status",
      "Interval": "10s",
      "TTL": "15s"
    }
}

consul.agent.service.register(opts, function(err) {
      if (err) throw err;
});

var server = new Hapi.Server();
server.connection({ port: 80 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world! -- From: ' + internalip + " " + colorDeploy + " deploy");
    }
});

server.route({
    method: 'GET',
    path: '/status',
    handler: function (request, reply) {
        reply('OK!');
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
