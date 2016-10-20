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
 * Note that a Webhook can implement both REST Webhook and IntegrationURI behavior,
 *      and [RULE1] if neither webhookURI nor integratioURI are specified, the Webhook will default to an Outgoing Integration
 * 
 * Note that a spark token must be specified for REST webhooks to fetch the text of messages/created events
 *  
 * config structure is: 
 *  { 
 * 		port:      		8080,						// optional, local dev env port, defaults to process.env.PORT, or 8080 	                   	
 * 		webhookURI: 	"/webhook" 					// optional, implements a REST Webhook behavior if present
 *  	integrationURI: "/integration"   		    // optional, implements an Outgoing integration behavior if present
 *  	healthURI : 	"/ping",  					// optional, health URI, defaults to "/ping"
 * 		token:  		"CISCO SPARK API TOKEN",    // optional, spark REST api token, defaults to SPARK_TOKEN env variable
 *  }
 * 
 */
function Webhook(config) {
	self = this;

	self.started = Date.now();

	// if [RULE1] default the Webhook to an outgoing integration
	if (!config || (!config.integrationURI)) {
		config = { integrationURI: "/integration" };
	}
	self.config = config;


	// Outgoing integration handler
	if (config.integrationURI) { 
		app.route(config.integrationURI)
			.get(function (req, res) {
				console.log("GET received instead of a POST");
				res.status(400).json({message: 'This outgoing integration is expecting an HTTP POST'});
			})
			.post(function (req, res) {
				console.log("outgoing integration invoked ");

				// Robustify: do not proceed if the payload does not comply with the expected message structure
				var message = validateMessage(req.body)
				if (!message) {
					console.log("unexpected message format, aborting: " + message);
					// let's consider this as a satisfying situation, it is simply a message structure we do not support
					// we do not want the webhook to resend us the message again and again 
					// => 200 OK: got it and we do not process further  
					res.status(200).json({'message': 'message format is not supported'});
					return;
				}

				// No text in there, only file attachments, not supported => ignoring
				if (!message.text) {
					console.log("No text in there, only file attachments, ignoring");
					res.status(200).json({'message': 'ignoring as no text was found'});
					return;
				}

				// Message is ready to be processed, let's respond to Spark without waiting whatever the processing outcome will be
				res.status(200).json({'message': 'message is being processed by webhook'});
				
				// INTEGRATION processing
				var handler = self.webhook;
				if (!handler) {
					console.log("no handler registered");
					return;
				}

				console.log('invoking message handler with message: ' + JSON.stringify(message));
				handler(message);
			});
	}

	// health endpoint
	var health = config.healthURI || "/ping";
	app.get(health, function (req, res) {
		res.json({
			'message': 'Congrats, your bot is up and running',
			'since': new Date(self.started).toISOString(),
			'integrationURI': config.integrationURI || null
		});
	});

	// Start bot
	var port = config.port || process.env.PORT || 8080;
	app.listen(port, function () {
		console.log("Cisco Spark bot started on port: " + port);
	});
}


// Register the handler which will process the specified resource + event 
// The handler should have a function(data) signature
Webhook.prototype.register = function(handler) {

	// Robustify
	if (!handler) {
		console.log("no handler specified, cannot register function");
		return;
	}

	// Add handler
	self.webhook = function(data) {
		handler(data);
	};
}


//  Returns a message if the payload complies with the documentation, undefined otherwise
//  see https://developer.ciscospark.com/endpoint-messages-messageId-get.html for more information
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
function validateMessage(payload) {
    if (!payload 	|| !payload.id 
                    || !payload.personId 
                    || !payload.personEmail 				
                    || !payload.roomId  
                    || !payload.created) {
        console.log("message structure is not compliant");
        return undefined;
    }
    if (!payload.text && !payload.files) {
        console.log("message structure is not compliant: no text nor file in there");
        return undefined;
    }
    return payload;
}

module.exports = Webhook
