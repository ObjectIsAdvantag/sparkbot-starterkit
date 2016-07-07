// CiscoSpark defines 2 types of webhooks
// - REST webhook : receive all events from a Room (NewMessage is the only even supported as of v1),
//     see https://developer.ciscospark.com/webhooks-explained.html and https://developer.ciscospark.com/resource-webhooks.html
// - Outgoing integration : receive new messages from a Room, REST API not documented.
//     launch the CiscoSpark Web client, go to a Room, look for the integrations on the right panel, create a new integration

var https = require('https');
var express = require('express');
var app = express();

// use bodyParser to read data from a POST
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


/* Starts a Cisco Spark webhook with specified configuration
 *
 *  { 
 * 		port:      		8080,						// local dev env port, optional, defaults to process.env.PORT, or 8080 	                   	
 * 		webhookURI: 	"/webhook" 					// implements a REST Webhook behavior if present
 *  	integrationURI: "/integration"   		    // implements an Outgoing integration behavior if present
 *  	healthURI : 	"/ping",  					// health URI, optional, defaults to "/ping"
 * 		token:  		"ERTCSGJTYJDSQFSDFDSFsd",   // Spark token, mandatory for REST webhook to decrypt incoming message
 *  }
 * 
 */
function Webhook(config) {
	self = this;

	self.started = Date.now();

	function execute(message) {
		if (self.handler) {
			self.handler(message);
		}
	}

	if (!config) {
		config = { integrationURI: "/integration" };
		console.log('No configuration => starting up as an incoming integration...');
		//console.log('No configuration, exiting...');
		//throw createError('bot configuration error');
	}

	// health endpoint
	var health = config.healthURI || '/ping';
	app.get(health, function (req, res) {
		res.json({
			'message': 'Congrats, your bot is up and running',
			'since': new Date(self.started).toISOString(),
			'integrationURI': config.integrationURI || null,
			'webhookURI': config.webhookURI || null		
		});
	});

	// REST webhook handler
	if (config.webhookURI) {
		app.route(config.webhookURI)
			.get(function (req, res) {
				console.log('GET received instead of a POST')
				res.status(400).json({message: 'This REST webhook is expecting an HTTP POST'});
			})
			.post(function (req, res) {
				console.log('REST webhook invoked');

				// retreive message contents from spark
				if (!req.body || !req.body.data) {
					console.log('Unexpected payload, check webhook configuration')
					res.status(400).json({message: 'Wrong payload, a data payload is expected for REST webhooks',
										  details: 'either the bot is misconfigured or Cisco Spark is running a new API version'});
					return;
				}

				var newMessageEvent = req.body.data;
				var options = {
					'method': 'GET',
					'hostname': 'api.ciscospark.com',
					'path': '/v1/messages/' + newMessageEvent.id,
					'headers': {'authorization': 'Bearer ' + config.token}
				};
				console.log('Asking for decrypted message');
				var req = https.request(options, function (response) {
					console.log('Received decrypted message, decoding');
					var chunks = [];
					response.on('data', function (chunk) {
						chunks.push(chunk);
					});
					response.on("end", function () {
						var message = JSON.parse(Buffer.concat(chunks));

						// WEBHOOK processing
						console.log("Processing message: " + JSON.stringify(message));
						execute(message);
					});
				});
				req.end();

				// event processed, let's respond to spark
				res.status(200).json({'message': 'message processed by webhook'});
			});
	}

	// Outgoing integration handler
	if (config.integrationURI) { 
		app.route(config.integrationURI)
			.get(function (req, res) {
				console.log('GET received instead of a POST');
				res.status(400).json({message: 'This outgoing integration is expecting an HTTP POST'});
			})
			.post(function (req, res) {
				console.log('Outgoing integration invoked ');

				var message = req.body;
				res.status(200).json({'message': 'message processed by integration'});

				// INTEGRATION processing
				console.log('Processing message: ' + JSON.stringify(message));
				execute(message);
			});
	}

	// Start bot
	var port = config.port || process.env.PORT || 8080;
	app.listen(port, function () {
		console.log('Cisco Spark bot started on port: ' + port);
	});
}


// Register the specified function to process new messages
// The function should have a function(message) signature
// Message is an object instantiated from json payloads such as :
//
//   {
//   	"id" : "46ef3f0a-e810-460c-ad37-c161adb48195",
//   	"personId" : "49465565-f6db-432f-ab41-34b15f544a36",
//   	"personEmail" : "matt@example.com",
//   	"roomId" : "24aaa2aa-3dcc-11e5-a152-fe34819cdc9a",
//   	"text" : "PROJECT UPDATE - A new project project plan has been published on Box",
//   	"files" : [ "http://www.example.com/images/media.png" ],
//   	"toPersonId" : "Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mMDZkNzFhNS0wODMzLTRmYTUtYTcyYS1jYzg5YjI1ZWVlMmX",
//   	"toPersonEmail" : "julie@example.com",
//   	"created" : "2015-10-18T14:26:16+00:00"
//   }
//
// Check https://developer.ciscospark.com/endpoint-messages-messageId-get.html for more information
Webhook.prototype.register = function(registered) {
	this.handler = function(message) {
		registered(message);
	};
}


module.exports = Webhook