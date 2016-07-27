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
 *      homogenize:     true                        // optional, defaults to true, goal gere is to try to homogenize the message in case of new Messages/Created event raised by REST webhook and processed via a bot account  
 *  }
 * 
 */
function Webhook(config) {
	self = this;

	self.started = Date.now();

	function execute(message, text) {
		if (self.handler) {
			self.handler(message, text);
		}
		else {
			console.log("no handler registered for event Messages/Created");
		}
	}

	function triggerMessageCreatedEvent(originalResponse, triggerData) {
		// Check the event is well formed
		if (!triggerData.id) {
			console.log("no message id, aborting...");
			originalResponse.status(500).json({'message': 'could not retreive the message contents, no message id there !'});
			return;
		}
		var messageId = triggerData.id;

		// Retreive text for message id
		console.log("requesting message contents");
		var options = {
						'method': 'GET',
						'hostname': 'api.ciscospark.com',
						'path': '/v1/messages/' + messageId,
						'headers': {'authorization': 'Bearer ' + self.config.token}
					};
		var req = https.request(options, function (response) {
			console.log('assembling message');
			var chunks = [];
			response.on('data', function (chunk) {
				chunks.push(chunk);
			});
			response.on("end", function () {
				if (response.statusCode != 200) {
					console.log("status code: " + response.statusCode + " when retreiving message with id: " + messageId);
					originalResponse.status(500).json({'message': 'status code: ' + response.statusCode + ' when retreiving the text of the message with id:' + messageId});
					return;
				}
					
				// Robustify
				if (!chunks) {
					console.log("unexpected payload: empty");
					// let's consider this as a satisfying situation, it is simply a message structure we do not support
					// we do not want the webhook to resend us the message again and again 
					// => 200 OK: got it and we do not process further  
					originalResponse.status(200).json({'message': 'unexpected payload for new message with id:' + messageId});
					return;
				}
				var payload = JSON.parse(Buffer.concat(chunks));
				var message = validateMessage(payload);
				if (!message) {
					console.log("unexpected message format, aborting...");
					// let's consider this as a satisfying situation, it is simply a message structure we do not support
					// we do not want the webhook to resend us the message again and again 
					// => 200 OK: got it and we do not process further  
					originalResponse.status(200).json({'message': 'no content to process for new message with id:' + messageId});
					return;
				}

				// event is ready to be processed, let's respond to Spark without waiting whatever the processing outcome will be
				originalResponse.status(200).json({'message': 'message is being processed by webhook'});

				// processing happens now
				console.log("calling handler to process 'Message/Created' event");
				//console.log("now processing 'Messages/Created' event with contents: " + JSON.stringify(message)); // for debugging purpose only

				// if we're a bot account and the message is emitted in a "group" room, the message contains the bot display name (or a fraction of it)
				// removing the bot name (or fraction) can help provide homogeneous behavior in direct & group rooms, as well as Outgoing integrations
				if (self.config.homogenize && (message.roomType == "group") && (self.accountType == "BOT")) {
					console.log("trying to homogenize message");
					var homogenized = trimBotName(message.text, self.account.displayName);
					execute(message, homogenized);
				}
				else {
					execute(message, message.text);
				}
			});

		});
		req.on('error', function(err) {
  			console.log("cannot retreive message with id: " + messageId + ", error: " + err);
			originalResponse.status(500).json({'message': 'could not retreive the text of the message with id:' + messageId});
			return;
		});
		req.end();
	}

	// if [RULE1] default the Webhook to an outgoing integration
	if (!config || (!config.webhookURI && !config.integrationURI)) {
		config = { integrationURI: "/integration" };
		console.log('no configuration => starting up as an incoming integration...');
	}
	self.config = config;

	// Check a Spark Token is present, and if so, detect account type
	var token = config.token || process.env.SPARK_TOKEN;
	if (token) {
		self.config.token = token;
		// Check the Spark Token is valid 
		checkAccountType(token, function(err, type, people) {
			if (err) {
				console.log("could not retreive account type, err: " + err + ", continuing for now...");
			}
			else {
				self.accountType = type;
				self.account = people;
			}
		});
	}

	self.config.homogenize = config.homogenize || true;

	// REST webhook handler
	if (config.webhookURI) {
		// Robustify: check a valid spark token is present
		if (!token) {
			console.log("no token, the webhook will not be able to read events data => exiting...");
			process.exit(1);
		}
		// if (self.accountType === undefined) {
		// 	console.log('invalid token, the webhook will not read events data => exiting...');
		// 	process.exit(2);				
		// }
		
		app.route(config.webhookURI)
			.get(function (req, res) {
				console.log("GET received instead of a POST");
				res.status(400).json({message: 'This REST webhook is expecting an HTTP POST'});
			})
			.post(function (req, res) {
				console.log("REST webhook invoked");

				// analyse payload
				if (!req.body || !req.body.data || !req.body.resource || !req.body.event) {
					console.log("Unexpected payload: no data, resource or event in body, aborting...");
					res.status(400).json({message: 'Wrong payload, a data+resource+event payload is expected for REST webhooks',
										  details: 'either the bot is misconfigured or Cisco Spark is running a new API version'});
					return;
				}
				var resource = req.body.resource;
				var event = req.body.event;
				var data = req.body.data;

				// take action depending on event and ressource triggered
				// see https://developer.ciscospark.com/webhooks-explained.html
				switch (resource) {
					case "messages":
						switch (event) {
							case "created": 
								triggerMessageCreatedEvent(res, data);
								break;

							case "deleted":
							default:
								console.log("this webhook does not support this resource/event type: messages/deleted");
								res.status(500).json({message: 'This webhook does not support this resource/event type: messages/deleted'});
								break; 
						}
						break;

					default:
						console.log("this webhook does not support this resource/event type: " + resource + "/" + event);
						res.status(500).json({message: 'This webhook does not support this resource/event type: ' + resource + '/' + event });
						break;
				}
			});
	}

	// Outgoing integration handler
	if (config.integrationURI) { 
		app.route(config.integrationURI)
			.get(function (req, res) {
				console.log("GET received instead of a POST");
				res.status(400).json({message: 'This outgoing integration is expecting an HTTP POST'});
			})
			.post(function (req, res) {
				console.log("outgoing integration invoked ");

				// Robustify: do not proceed if the paylod does not comply with the expected message structure
				var message = validateMessage(req.body)
				if (!message) {
					console.log("unexpected message format, aborting: " + message);
					// let's consider this as a satisfying situation, it is simply a message structure we do not support
					// we do not want the webhook to resend us the message again and again 
					// => 200 OK: got it and we do not process further  
					originalResponse.status(200).json({'message': 'message format is not supported'});
					return;
				}

				res.status(200).json({'message': 'message processed by integration'});

				// INTEGRATION processing
				console.log('invoking message handler: ' + JSON.stringify(message));
				execute(message, message.text);
			});
	}

	// health endpoint
	var health = config.healthURI || "/ping";
	app.get(health, function (req, res) {
		res.json({
			'message': 'Congrats, your bot is up and running',
			'since': new Date(self.started).toISOString(),
			'integrationURI': config.integrationURI || null,
			'webhookURI': config.webhookURI || null,
			'processable': '[messages/created]',		// [TODO] should dynamicaly explore the registered handlers
			'accountType' : self.accountType			// undefined, HUMAN or BOT
		});
	});

	// Start bot
	var port = config.port || process.env.PORT || 8080;
	app.listen(port, function () {
		console.log("Cisco Spark bot started on port: " + port);
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
	this.handler = function(message, text) {
		registered(message, text);
	};
}

// Returns a trigger if the payload complies with the documentation, undefined otherwise
// see https://developer.ciscospark.com/webhooks-explained.html 
//
//   {
//     "id":"Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjRlNjA1NjAtNjYwMi00ZmIwLWEyNWEtOTQ5ODgxNjA5NDk3",
//     "name":"Guild Chat to http://requestb.in/1jw0w3x1",
//     "resource":"messages",
//     "event":"created",
//     "filter":"roomId=Y2lzY29zcGFyazovL3VzL1JPT00vY2RlMWRkNDAtMmYwZC0xMWU1LWJhOWMtN2I2NTU2ZDIyMDdi",
//     "data":{
//       "id":"Y2lzY29zcGFyazovL3VzL01FU1NBR0UvMzIzZWUyZjAtOWFhZC0xMWU1LTg1YmYtMWRhZjhkNDJlZjlj",
//       "roomId":"Y2lzY29zcGFyazovL3VzL1JPT00vY2RlMWRkNDAtMmYwZC0xMWU1LWJhOWMtN2I2NTU2ZDIyMDdi",
//       "personId":"Y2lzY29zcGFyazovL3VzL1BFT1BMRS9lM2EyNjA4OC1hNmRiLTQxZjgtOTliMC1hNTEyMzkyYzAwOTg",
//       "personEmail":"person@example.com",
//       "created":"2015-12-04T17:33:56.767Z"
//     }
//   } 
function valideTrigger(payload) {
    if (!payload 	|| !payload.id 
                    || !payload.name 
                    || !payload.resource 
                    || !payload.event) {
        console.log("trigger structure is not compliant");
        return undefined;
    }
    return payload;
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
					|| !payload.roomType 
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

// Detects account type by invoking the Spark People ressource
//    - HUMAN if the token corresponds to a bot account, 
//    - BOT otherwise
//
// cb function signature should be (err, type, account) where type: HUMAN|BOT, account: People JSON structure
//
function checkAccountType(token, cb) {
	//console.log("checking Spark account");
	var options = {
						'method': 'GET',
						'hostname': 'api.ciscospark.com',
						'path': '/v1/people/me',
						'headers': {'authorization': 'Bearer ' + token}
					};
	var req = https.request(options, function (response) {
		//console.log('assembling message');
		var chunks = [];
		response.on('data', function (chunk) {
			chunks.push(chunk);
		});
		response.on("end", function () {
			if (response.statusCode == 401) {
				return cb(new Error("response status: " + response.statusCode + ", bad token"), null, null);
			}
			if (response.statusCode != 200) {
				return cb(new Error("response status: " + response.statusCode), null, null);
			}
				
			// Robustify
			if (!chunks) {
				return cb(new Error("unexpected payload: empty"), null, null);
			}
			var payload = JSON.parse(Buffer.concat(chunks));
			if (!payload.emails) {
				return cb(new Error("unexpected payload: not json"), null, null);
			}
			var email = payload.emails[0];
			if (!email) {
				return cb(new Error("unexpected payload: no email"), null, null);
			}

			// Check if email corresponds to a spark bot
			var splitted = email.split("@");
			if (!splitted || (splitted.length != 2)) {
				return cb(new Error("unexpected payload: malformed email"), null, null);
			}
			var domain = splitted[1];
			if ('sparkbot.io' == domain) {
				console.log("bot account detected, name: " + payload.displayName);
				return cb(null, "BOT", payload);	
			} 

			console.log("human account detected, name: " + payload.displayName);
			return cb(null, "HUMAN", payload);
		});
	});
	req.on('error', function(err) {
		console.log("cannot find Spark account for token, error: " + err);
		cb(new Error("cannot find Spark account for token"), null, null);
	});
	req.end();
}

// Remove leading bot name (or fraction) from text 
function trimBotName(text, name) {
	// [TODO] quick implem here
	var splitted = name.split(' ');
	var nickname = splitted[0];
	if (text.startsWith(nickname)) {
		console.log("text needs to be trimmed")
		return text.substring(nickname.length);
	}
	return text;
}

module.exports = Webhook