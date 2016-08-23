/*
 * Example of an integration that echoes new Cisco Spark messages to the console
 *    - as a REST Webhook, associated to a Developer Account
 *     AND
 *    - as an Outgoing integration, associated to a Spark room
 *
 */
var SparkBot = require("../sparkbot-starterkit");

var config = {
  token: process.env.SPARK_TOKEN, 
  webhookURI: "/webhook",
  integrationURI: "/integration"
};

// Starts your Webhook
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
});

