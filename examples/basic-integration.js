// Simple bot that echoes to the console as new messages are posted

var SparkBot = require('../sparkbot');

var config = {
  attach_as: "integration",
  //port: 8080,
  //URI: "/sparkbot"
};

// init flint framework
var bot = new SparkBot(config);

// echo test
//bot.process(function(message) {
//  console.log("received text: " + message.text + ", from: " + message.personEmail)
//});

