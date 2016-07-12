/*
 * Simple bot that echoes new Cisco Spark messages to the console
 *
 * Illustrates a REST Webhook
 *
 */
var SparkBot = require("../sparkbot-starterkit");

var config = {
  /// Cisco Spark API token, note that it is mandatory for webhooks to decode new messages
  token: process.env.SPARK_TOKEN,
  webhookURI: "/webhook"
};

// Starts your Webhook
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text)
});

