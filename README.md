# Yet Another Unofficial StarterKit to create Cisco Spark bots in NodeJS

A minimal NodeJS Starter Kit to create your own [Spark](https://ciscospark.com/) bot, with few dependencies and goal to keep them at a minimum (Express that's it). 
Started after [@CiscoDevNet SmartCity Paris](https://twitter.com/hashtag/devnethackathon) and @TADHack London hackathons, to bootstrap dev teams in minutes.

New to Cisco Spark ?
start with the [Web Client](https://web.ciscospark.com/) (signup, enjoy the free chat, with end to end securiy and integrated video).

Quick setup :
- pick an example, run it locally and expose it to the world,
- attach your sparkbot to a Room and start interacting,

Looking for :
- an advanced Spark Bot Engine with self Room registration, check Nick Marus's [flint](https://github.com/nmarus/flint) and [quickstart](https://github.com/nmarus/flint/blob/master/quickstart/README.md).


# Pick a sparkbot example and run it

Go to the examples directory and pick an nodejs example. 
We suggest you start with the "basic-webhook.js". 

Hereafter we show you the code, you do not need to modify it for now.
You'll create your custom sparkbot later, by copy pasting an example and extend the code.


``` nodejs
var SparkBot = require("sparkbot-starterkit");

var config = {
  // Cisco Spark API token, note that it is mandatory for webhooks to decode new messages
  token: process.env.SPARK_TOKEN,

  attach_as: "webhook",
  port: 8080,
  URI: "/webhook"
};

// Starts your Webhook
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark 
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text)
});
```


Well, time to run your sparkbot and expose it to the Web. 
Let's do that !

``` bash
// download the spark bot source code  
> git clone https://github.com/ObjectIsAdvantag/sparkbot-starterkit
> cd sparkbot-starterkit
> npm install

// if you are in OSX you have to run
> sudo npm install

// pick an example 
> cd examples

// launch your spark bot, default to port 8080
// note: your cisco spark token can be retreived by clicking on your account picture (upper right corner of the [developer documentation](https://developer.ciscospark.com/getting-started.htm))
> SPARK_TOKEN=XXXXXXXXXXXX node basic-webhook.js
Cisco Spark bot started, running on port 8080

// open a second console and check your bot is running by hitting your sparkbot health resource:
// open in a web browser http://localhost:8080/ping/ 
// or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
> curl http://localhost:8080/ping/
// OSX note: if localhost doesn't work for you, try 127.0.0.1
{"message":"Congrats, your bot is up and running","isWebhook":true,"isIntegration":false,"URI":"http://localhost:8080/webhook"}

// if you're running your bot on a private network, install localtunnel
> npm install -g localtunnel

// launch a tunnel and expose your http://localhost:8080 endpoint
// note1: go for your bot nameso that you make sure you do not collide with another bot developer !
// note2: once you'll have your bot successfully setup, you'll may want to run localtunnel forever:
//     ex: while true; do lt -s sparkbot -p 8080; done
> lt -s sparkbot -p 8080
your url is: https://sparkbot.localtunnel.me

// check everything is running ok by hitting your sparkbot health resource
// open in a web browser https://sparkbot.localtunnel.me/ping/ 
// or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
> curl -v -X GET https://sparkbot.localtunnel.me/ping
* ...
* NPN, negotiated HTTP1.1
* ...
* SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
* ...
HTTP/1.1 200 OK
{
    "message":"Congrats, your bot is up and running",
    "isWebhook":true,
    "isIntegration":false,
    "URI":"http://localhost:8080/webhook"
}
```

# How to attach your bot to a Spark room

CiscoSpark defines 2 types of webhooks:

- HTTP webhooks : receive all events fired by a Spark Room, 'NewMessage' is the only event fired as of April 2016 (more coming),
- outgoing integrations : receive new message events fired by a Spark Room.

The bot proposed by the StarterKit proposes 2 endpoints /webhook and /integration so that you can pick one or another way to attach the bot to a Spark Room.


## attach via a REST Webhook

Attaching a REST webhook to a Spark room is explained in the [Cisco Spark developer documentation](https://developer.ciscospark.com/webhooks-explained.html)

Quick setup:
- [lists your rooms](https://developer.ciscospark.com/endpoint-rooms-get.html), choose one, pick its room id,
- [add a webhook](https://developer.ciscospark.com/endpoint-webhooks-post.html) with a filter for the roomId above, and with a targetUrl pointing to your /webhook endpoint, ex: https://sparkbot.localtunnel.me/webhook.

Take [DevNet Learning lab](https://learninglabs.cisco.com/lab/collab-sparkwebhook/step/1) for a step by step tutorial.


## attach via an Outgoing integration

Outgoing integrations can be created directly from the Cisco Spark web client.
Note: you may also use the REST API /webhooks/outgoing resource.

Quick setup:
- launch the [Web client](https://web.ciscospark.com),
- pick a Room, look for the integrations pane on the right,
- create a new integration of type "outgoing webhook" with a targetUrl pointing to your bot /integration URI, ex: https://sparkbot.localtunnel.me/integration.


# Troubleshooting

For debugging purpose, you may want to use a WebAPI Traffic inspector.

If you're looking for options, Windows users generally use [Fiddler](https://www.telerik.com/download/fiddler).

Linux and Mac users may give a try to [smartproxy](https://github.com/ObjectIsAdvantag/smartproxy): an experimental #golang traffic capture tool.

``` text
https://sparkbot.localtunnel.me
<-internet->
http://localhost:9090
<-lan->
:8080
```

Simply [pick a binary](https://github.com/ObjectIsAdvantag/smartproxy/releases/tag/v0.4) for your platform, and run through these following steps.

``` bash
// download a Windows exe or Mac / Linux binary, set as executable, launch
> mv smartproxy.mac smartproxy
> chmod 755 smartproxy
> ./smartproxy --capture
// by default smartproxy routes traffic from localhost:9090 to localhost:8080
// the capture option let you to see incoming traffic

// launch a tunnel to local port 9090
> lt -s sparkbot -p 9090
// your bot is now exposed publically at https://sparkbot.localtunnel.me/

// launch your bot, defaults to port 8080
> SPARK_TOKEN=XXXXXXXXXX node server.js

// chat in the spark room

// now examine traffic by opening http://localhost:9090/traffic with a web browser
// select an HTTP request/response
// look at the smartproxy console to get the request and response payloads
```
