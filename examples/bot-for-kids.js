/*
 * Cisco Spark Bot to interact with kids aged 7 to 10
 *
 * Leverages the basic-integration example : Simple Outgoing Integration
 * + a Spark Token to write back to the room
 *
 * INSTALLATION NOTES : the node-sparky is required, to install it run :
 *   > npm install node-sparky
 */
var SparkBot = require("../sparkbot-starterkit");
var Sparky = require("node-sparky");

var config = {
  integrationURI: "/newmessages",

  // Required for the bot to push messages back to the Spark room
  token: process.env.SPARK_TOKEN,

  name: "Daisy",
  peopleId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8zNzYzZGNhMi1jZmQ1LTQ0ZTMtYWMwNy1iOTIzZTYxZDc2M2M"
};

// Starts your bot
var bot = new SparkBot(config);

// Create a Spark client to send messages back to the Room
var sparky = new Sparky({ token: config.token });

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
  console.log("New message from " + message.personEmail + ": " + message.text);

  // If the message comes from the bot, do nothing
  if (message.personId === config.peopleId) {
    console.log("bot is writing => ignoring");
    return;
  }

  // Check that the message is sent to the bot or contains the bot name
  var lower = message.text.toLowerCase();
  if ((message.toPersonId != config.peopleId)&& (lower.indexOf(config.name.toLowerCase()) == -1)) {
    console.log("bot not concerned => ignoring");
    return;
  }

  if ((lower.indexOf("chiens") > -1) || (lower.indexOf("dogs") > -1)) {
    showDogs(message.roomId);
    return;
  }

  if ((lower.indexOf("chat") > -1) || (lower.indexOf("cat") > -1)) {
    if ((lower.indexOf("chien") > -1) || (lower.indexOf("dog") > -1)) {
      showCatAndDogTogether(message.roomId);
    }
    else {
      showCat(message.roomId);
    }
    return;
  }

  if ((lower.indexOf("chien") > -1) || (lower.indexOf("dog") > -1)) {
    showDog(message.roomId);
    return;
  }

  if (lower.indexOf("bonjour") > -1) {
    sayBonjour(message.roomId);
    return;
  }

  if (lower.indexOf("hello") > -1) {
    sayHello(message.roomId);
    return;
  }

  if (lower.indexOf("histoire") > -1) {
    sayHistoire(message.roomId);
    return;
  }

  displayAide(message.roomId);
});

function sendText(roomId, message) {
  sparky.message.send.room(roomId, {
    text: message
  }, function (err, results) {
    if (err) {
      console.log("could not send the text back to the room: " + err);
    }
    else {
      console.log("sendText command successful");
    }
  });
}

function sendImage(roomId, url) {
  sparky.message.send.room(roomId, {
    file: url
  }, function (err, results) {
    if (err) {
      console.log("could not send the image back to the room: " + err);
    }
    else {
      console.log("sendImage command successful");
    }
  });
}

function displayAide(roomId) {
  sendText(roomId, "Bonjour. Veux-tu que je vous raconte une histoire, que je vous écoute ou bien que souhaites-tu tenter un défi ?")
}

function showCat(roomId) {
  sendImage(roomId, "http://www.monchatonetmoi.com/upload/images/portrait-chaton.jpg");
}

function showDog(roomId) {
  sendImage(roomId, "http://anima-vet.fr/wp-content/uploads/2016/04/chiot1.png");
}

function showCatAndDogTogether(roomId) {
  sendImage(roomId, "http://www.santevet.com/media/cache/edito_article/upload/admin/images/article/chien_chat_commun%202/Dossier%20%C3%A2ges/chiot%20et%20chaton%20ensemble.jpg");
}

function showDogs(roomId) {
  sendImage(roomId, "http://www.chiens-online.com/_upload/ressources/global/vignettes/actualite/tas_de_chiots_267_251_filled.jpg");
}

function sayBonjour(roomId, toPersonId) {
  sendText(roomId, "Bonjour, je vais très bien aujourd'hui ! ");
}
function sayHello(roomId, toPersonId) {
  sendText(roomId, "Hi, I am feeling good today !");
}

function sayHistoire(roomId) {
  // http://www.iletaitunehistoire.com/genres/contes-legendes/lire/la-princesse-au-petit-pois-biblidcon_021
  var histoire = "Avec plaisir, voici l'histoire de la Princesse au petit pois";
  sendText(roomId, histoire);

    histoire = "Il était une fois un prince qui voulait épouser une princesse, mais une vraie princesse. Il fit le tour de la Terre pour en trouver une mais il y avait toujours quelque chose qui clochait ; des princesses, il n'en manquait pas, mais étaient-elles de vraies princesses ? C'était difficile à apprécier ; toujours une chose ou l'autre ne lui semblait pas parfaite. Il rentra chez lui tout triste, il aurait tant voulu rencontrer une véritable princesse.";
  sendText(roomId, histoire);

  histoire = "Un soir, par un temps affreux, éclairs et tonnerre, cascades de pluie que c'en était effrayant, on frappa à la porte de la ville et le vieux roi lui-même alla ouvrir. C'était une princesse qui était là, dehors. Mais grands dieux ! de quoi avait-elle l'air dans cette pluie, par ce temps ! L'eau coulait de ses cheveux et de ses vêtements, entrait par la pointe de ses chaussures et ressortait par le talon… et elle prétendait être une véritable princesse !";
  sendText(roomId, histoire);

  histoire = "'Nous allons bien voir ça', pensait la vieille reine, mais elle ne dit rien. Elle alla dans la chambre à coucher, retira toute la literie et mit un petit pois au fond du lit ; elle prit ensuite vingt matelas qu'elle empila sur le petit pois et, par-dessus, elle mit encore vingt édredons en plumes d'eider. C'est là-dessus que la princesse devait coucher cette nuit-là. Au matin, on lui demanda comment elle avait dormi.";
  sendText(roomId, histoire);

  histoire = "'Affreusement mal', répondit-elle, je n'ai presque pas fermé l'œil de la nuit. Dieu sait ce qu'il y avait dans ce lit. J'étais couchée sur quelque chose de si dur que j'en ai des bleus et des noirs sur tout le corps ! C'est terrible !";
  sendText(roomId, histoire);

  histoire = "Alors ils reconnurent que c'était une vraie princesse puisque, à travers les vingt matelas et les vingt édredons en plumes d'eider, elle avait senti le petit pois. Une peau aussi sensible ne pouvait être que celle d'une authentique princesse.";
  sendText(roomId, histoire);

  histoire = "Le prince la prit donc pour femme, sûr maintenant d'avoir trouvé une vraie princesse, et le petit pois fut exposé dans le cabinet des trésors d'art, où l'on peut encore le voir si personne ne l'a emporté. Et ceci est une vraie histoire."
  sendText(roomId, histoire);

  var histoire = "Est-ce que tu as aimé cette histoire ?";
  sendText(roomId, histoire);
}
