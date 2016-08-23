/*
 * Example of a REST webhook which registers various events
 *
 */
var SparkBot = require("../sparkbot-starterkit");

var config = {
  token: process.env.SPARK_TOKEN, 
  webhookURI: "/webhook"
};

// Starts your Webhook
var bot = new SparkBot(config);

bot.register(function(message) {
  console.log("New message from: " + message.personEmail + ", contents: " + message.text + ", in room: " + message.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'messages', 'created');

bot.register(function(message) {
  console.log("Deleted message from: " + message.personEmail + ", in room: " + message.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'messages', 'deleted');

bot.register(function(membership) {
  console.log("New member: " + membership.personEmail + ", added to room: " + membership.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'memberships', 'created');


bot.register(function(membership) {
  console.log("Deleted member: " + membership.personEmail + ", from room: " + membership.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'memberships', 'deleted');


bot.register(function(room) {
  console.log("New room: " + room.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'rooms', 'created');


bot.register(function(room) {
  console.log("Updated room: " + room.roomId);

  //
  // ADD YOUR CUSTOM CODE HERE
  //
  
}, 'rooms', 'updated');
