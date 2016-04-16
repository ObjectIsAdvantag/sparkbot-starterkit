/*
 * Simple bot that echoes to the console as all new messages posted in a Cisco Spark Room
 *
 * Illustrate a REST Webhook
 *
 * Check the documentation to set up this example
 *
 */
var SparkBot = require("../sparkbot");

var config = {
  attach_as: "integration",
  port: 8080,
  URI: "/integration"
};

// initialize and start bot
var bot = new SparkBot(config);

// register a basic echo function
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text)
});


