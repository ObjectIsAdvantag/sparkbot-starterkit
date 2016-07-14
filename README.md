# Yet Another Unofficial StarterKit to create Cisco Spark bots in NodeJS

A minimal NodeJS Starter Kit to create your own [Spark](https://ciscospark.com/) bot, with few dependencies and goal to keep them at a minimum (Express that's it). 
Started after [@CiscoDevNet SmartCity Paris](https://twitter.com/hashtag/devnethackathon) and @TADHack London hackathons, to bootstrap dev teams in minutes.

Note that the StarterKit implements both Cisco Spark webhooks mecanisms: REST webhook and incoming integrations (see below for details). 
Moreover, the StarterKit allows to implement both simultaneously for ultimate flexbility.

Quick setup :
- run examples/no-config.js locally, and expose it with localtunnel or ngrok (see below for details),
- add an incoming integration to a Spark room pointing to your bot public address

New to Cisco Spark ?
- Spark is Cisco's Cloud Collaboration Services, which unifies team collaboration for the enterprise,
- start with the [Web Client](https://web.ciscospark.com/) (signup, enjoy the free chat service, with end to end securiy and integrated video).

Looking for a more advanced Spark Bot Engine ?
- check Nick Marus's [flint](https://github.com/nmarus/flint) and [quickstart](https://github.com/nmarus/flint/blob/master/quickstart/README.md).


# Quick start

Create a Cisco Spark "Outgoing Webhook" integration pointing to https://myawesomebot.localtunnel.me/integration

and run the following commands on your local machine.

``` bash
# In a bash shell
> npm install sparkbot-starterkit
> cd sparkbot-starterkit
> node tests/no-config.js
no configuration => starting up as an incoming integration...
Cisco Spark bot started on port: 8080

# In a second bash shell
> npm install -g localtunnel
> lt -s myawesomebot -p 8080
your url is: http://myawesomebot.localtunnel.me
```


# Start an incoming integration Bot

Create the myfirstbot.js file below or pick an example from directory.

``` nodejs
var SparkBot = require("sparkbot-starterkit");

// Starts a Webhook as an incoming integration, listening at :8080/integration
var bot = new SparkBot();

// This function will be called every time a new message is posted into Spark 
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text)
});
```

You're all set, let's run your sparkbot 

``` bash
# if you are running OSX 
> sudo npm install express sparkbot-starterkit
# if you are running Windows
> npm install express sparkbot-starterkit

# launch your spark bot, default to port 8080
# note: your cisco spark token can be retreived by clicking on your account picture (upper right corner of the [developer documentation](https://developer.ciscospark.com/getting-started.htm))
> node myfirstbot.js
No configuration => starting up as an incoming integration...
Cisco Spark bot started on port: 8080

# open a second console and check your bot is running by hitting your sparkbot health resource:
# open in a web browser http://localhost:8080/ping/ 
# or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
# OSX note: if localhost doesn't work for you, try 127.0.0.1
> curl http://localhost:8080/ping/

{"message":"Congrats, your bot is up and running","since":"2016-07-06T23:20:50.296Z","integrationURI":"/integration","webhookURI":null}

```


# Start a REST webhook Bot

Create the myfirstbot.js file below or pick an example from directory.

``` nodejs
var SparkBot = require("sparkbot-starterkit");

var config = {
  /// Cisco Spark API token, note that it is mandatory for webhooks to decode new messages
  token: process.env.SPARK_TOKEN,
  webhookURI: "/webhook"
};

// Starts a Webhook as an incoming integration, listening at :8080/integration
var bot = new SparkBot(config);

// This function will be called every time a new message is posted into Spark 
bot.register(function(message) {
  //
  // ADD YOUR CUSTOM CODE HERE
  //
  console.log("New message from " + message.personEmail + ": " + message.text)
});
```

You're all set, let's run your sparkbot 

``` bash
# if you are running OSX 
> sudo npm install express sparkbot-starterkit
# if you are running Windows
> npm install express sparkbot-starterkit

# launch your spark bot, default to port 8080
# note: your cisco spark token can be retreived by clicking on your account picture (upper right corner of the [developer documentation](https://developer.ciscospark.com/getting-started.htm))
> SPARK_TOKEN=XXXXXXXXXXXXX  node myfirstbot.js
Cisco Spark bot started on port: 8080

# open a second console and check your bot is running by hitting your sparkbot health resource:
# open in a web browser http://localhost:8080/ping/ 
# or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
# OSX note: if localhost doesn't work for you, try 127.0.0.1
> curl http://localhost:8080/ping/
{"message":"Congrats, your bot is up and running","since":"2016-07-06T23:33:15.535Z","integrationURI":null,"webhookURI":"/webhook"}

```


# How to expose your bot to the Web

``` bash
# if you're running your bot on a private network, install localtunnel
> npm install -g localtunnel

# launch a tunnel and expose your http://localhost:8080 endpoint
# note1: maje sure top choose a name that will not collide with another bot developer !
# note2: once you'll have your bot successfully setup, you'll may want to run localtunnel forever:
#     ex: while true; do lt -s sparkbot -p 8080; done
> lt -s sparkbot -p 8080
your url is: https://sparkbot.localtunnel.me

# check everything is running ok by hitting your sparkbot health resource
# open in a web browser https://sparkbot.localtunnel.me/ping/ 
# or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
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


## to attach a REST Webhook to a Spark Room:

Attaching a REST webhook to a Spark room is explained in the [Cisco Spark developer documentation](https://developer.ciscospark.com/webhooks-explained.html)

Quick setup:
- [lists your rooms](https://developer.ciscospark.com/endpoint-rooms-get.html), choose one, pick its room id,
- [add a webhook](https://developer.ciscospark.com/endpoint-webhooks-post.html) with a filter for the roomId above, and with a targetUrl pointing to your /webhook endpoint, ex: https://sparkbot.localtunnel.me/webhook.

Take [DevNet Learning lab](https://learninglabs.cisco.com/lab/collab-sparkwebhook/step/1) for a step by step tutorial.


## to attach an Outgoing integration to a Spark Room:

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
