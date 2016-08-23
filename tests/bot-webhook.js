/*
 * Example of an integration that echoes new Cisco Spark messages to the console
 *    - as a REST Webhook, associated to a Bot Account
 *
 * How to run
 *     1. Create a bot account, retreive its Spark API token
 *     2. Create a Spark Webhook
 *      
       curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer BOT_ACCOUNT_SPARK_API_TOKEN" 
        -d '{
              "name": "sparkbot-starterkit | test | bot-webhook",
              "resource": "messages",
              "event": "created",
              "targetUrl": "https://mybot.localtunnel.me/webhook"
            }' 
        "https://api.ciscospark.com/v1/webhooks/"
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

