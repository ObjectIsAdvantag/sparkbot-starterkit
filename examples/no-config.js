/* Most simplistic bot that echoes new Cisco Spark messages to the console
 * Exposed as a Cisco Spark Outgoing integration, listening on port 8080 
 */
var SparkBot = require("node-outgoing-webhooks");

var bot = new SparkBot().register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text)
});


