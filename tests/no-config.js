/* 
 * Illustrates the library default behavior
 *    -  an outgoing integration
 *    - listening at http://:8080/integration
 * 
 *
 */
var SparkBot = require("../starterkit");

var bot = new SparkBot().register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text);

  //
  // ADD YOUR CUSTOM CODE HERE
  //

});


