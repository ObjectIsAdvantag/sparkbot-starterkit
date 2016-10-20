/*
 * Example of an integration that echoes new Cisco Spark messages to the console
 *    - as an Outgoing integration, associated to a Spark room
 * 
 */
var SparkBot = require("../starterkit");

var config = {
  integrationURI: "/integration",
  port: 8080
};

// Starts your integration
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text)

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
});


