/*
 * Simple bot that takes action from a /echo command by sending back the message into the room
 *
 * Illustrates a REST Webhook
 *
 * INSTALLATION NOTES : the node-sparky is required, to install it run :
 *   > npm install node-sparky
 */
var SparkBot = require("../sparkbot-starterkit");
var Sparky = require("node-sparky");

var config = {
  /// Cisco Spark API token, note that it is mandatory for webhooks to decode new messages
  token: process.env.SPARK_TOKEN,
  webhookURI: "/webhook"
};

// Starts your Webhook
var bot = new SparkBot(config);

// Create a Spark client to send messages back to the Room
var sparky = new Sparky({ token: config.token });

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text);

  // Check if the message is the /echo command
  var command = message.text.match(/^(\/echo)\s+(.+)/);
  if(command && Array.isArray(command) && command.length){
    console.log("echo command detected");

    // removing first item containg full text in array;
    command.shift();
    // now command is an array containing
    //["/echo", "the message to echo"];

    // send the message into the room
    sparky.message.send.room(message.roomId, {
      text: command[1]
    }, function(err, results) {
      if (err) {
        console.log("could not send the message back to the room: " + err);
      }
      else {
        console.log("echo command successful");
      }
    });
  }

});

