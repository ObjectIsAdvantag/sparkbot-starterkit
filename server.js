var express = require('express');

var app = express();

var port = process.env.PORT || 8080;    

app.get('/', function (req, res) {
	res.json({ message: 'Your Cisco Spark bot is running' });  
});

app.listen(port, function () {
  console.log('Cisco Spark bot started, running on port ' + port);
});
