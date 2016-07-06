/*
 * Simple bot that echoes new Cisco Spark messages to the console
 *
 * Illustrates an Outgoing integration
 *
 */
var SparkBot = require("../sparkbot-starterkit");

// No config => will start as an integration
var bot = new SparkBot();

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text)
});


