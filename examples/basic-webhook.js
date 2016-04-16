/*
 * Simple bot that echoes to the console as all new messages posted in a Cisco Spark Room
 *
 * Illustrates a REST Webhook
 *
 */
var SparkBot = require("../sparkbot");

var config = {
  // bot spark api token, mandatory for webhooks
  token: process.env.SPARK_TOKEN,

  attach_as: "webhook",
  port: 8080,
  URI: "/webhook"
};

// init flint framework
var bot = new SparkBot(config);

// register a basic echo function
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text)
});

