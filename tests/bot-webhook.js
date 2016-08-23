/*
 * Example of an integration that echoes new Cisco Spark messages to the console
 *    - as a REST Webhook, associated to a Bot Account
 *
 */
var SparkBot = require("../sparkbot-starterkit");

var config = {
  token: process.env.SPARK_TOKEN,
  webhookURI: "/webhook",
  trimBotMention: true
};

// Starts your Webhook
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text);
  
  // In case the bot is associated to a Bot account, and was mentionned in a group room
  if (message.originalText) {
      console.log("   - original text: " + message.originalText);
  }

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
});

