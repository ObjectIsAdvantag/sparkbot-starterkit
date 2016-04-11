// CiscoSpark defines 2 types of webhooks
// - REST webhook : receive all events from a Room (NewMessage is the only even supported as of v1),
//     see https://developer.ciscospark.com/webhooks-explained.html and https://developer.ciscospark.com/resource-webhooks.html
// - outgoing integration : receive new messages from a Room, REST API not documented.
//     launch the CiscoSpark Web client, go to a Room, look for the integrations on the right panel, create a new integration

var express = require('express');
var port = process.env.PORT || 8080;
var webhookURI = "/webhook";
var integrationURI = "/integration";
var app = express();

//var Sparky = require('sparky');
//var sparkToken = process.env.SPARK_TOKEN;
//var sparky = new Sparky({ token: sparkToken });

// health endpoint
app.get('/', function (req, res) {
	res.json({ 'message': 'Your Cisco Spark bot is running', 'webhook': webhookURI, 'integration': integrationURI, 'localport': port });
});

// use bodyParser to get the data from a POST
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// webhook handler
app.route(webhookURI)
	.get(function(req, res) {
		res.status(400).json({ message: 'This REST webhook is expecting an HTTP POST' });
	})
	.post(function(req, res) {
		var newMessage = req.body.data;
		console.log('received message from' + newMessage.personEmail);
		//processMessage(newMessage)
		res.status(200).json({ 'message': 'message processed by webhook' });
	});

// outgoing integration handler
app.route(integrationURI)
	.get(function(req, res) {
		res.status(400).json({ message: 'This outgoing integration is expecting an HTTP POST' });
	})
	.post(function(req, res) {
		var newMessage = req.body;
		console.log('received message from' + newMessage.personEmail);
		//processMessage(newMessage)
		res.status(200).json({ 'message': 'message processed by integration' });
	});


// start api
app.listen(port, function () {
  console.log('Cisco Spark bot started, running on port ' + port);
});


function processMessage(data, res) {
    console.log("received message : " + JSON.stringify(req.body));

    // TODO check the request is well formed

    res.status(200);
}
