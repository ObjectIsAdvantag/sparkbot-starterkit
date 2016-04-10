var express = require('express');
var app = express();

var port = process.env.PORT || 8080;
var webhook = process.env.WEBHOOK || "/webhook";

// health endpoint
app.get('/', function (req, res) {
	res.json({ 'message': 'Your Cisco Spark bot is running', 'webhook': webhook, 'localport': port });
});

// use bodyParser to get the data from a POST
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create webhook
app.route(webhook)
	.get(function(req, res) {
		res.status(400).json({ message: 'Your Webhook is expecting an HTTP POST' });
	})
	.post(function(req, res) {
		res.send('Add a book');
	});

// start api
app.listen(port, function () {
  console.log('Cisco Spark bot started, running on port ' + port);
});
