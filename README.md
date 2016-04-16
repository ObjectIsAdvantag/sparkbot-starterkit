# Yet Another Unofficial CiscoSpark NodeJS Bot StarterKit

A minimal NodeJS Starter Kit to create your own [CiscoSpark](https://ciscospark.com/) bot, with few dependencies (Express that's it) and goal to keep it as at a minimum. Started after [@CiscoDevNet SmartCity Paris](https://twitter.com/hashtag/devnethackathon) and @TADHack London hackathons, to bootstrap dev teams in minutes.

New to Cisco Spark ?
start with the [Web Client](https://web.ciscospark.com/) (signup, enjoy the free chat, with end to end securiy and integrated video).

Quick setup :
- run the sparkbot
- [optional] if local, run localtunnel to make your bot accessible from the internet,
- attach your sparkbot to a Room
- [optional] troubleshoot by visualizing realtime traffic to your webhook

Looking for :
- a StarterKit with a modular approach, check the [as-a-module branch](https://github.com/ObjectIsAdvantag/sparkbot-nodejs-starterkit/tree/as-a-module), the [webhook](https://github.com/ObjectIsAdvantag/sparkbot-nodejs-starterkit/blob/as-a-module/examples/basic-webhook.js) or [integration](https://github.com/ObjectIsAdvantag/sparkbot-nodejs-starterkit/blob/as-a-module/examples/basic-integration.js) examples and the [step by step guides](https://github.com/ObjectIsAdvantag/sparkbot-nodejs-starterkit/blob/as-a-module/docs/BasicWebhookSample.md).
- an advanced Spark Bot Engine with self Room registration, check Nick Marus's [flint](https://github.com/nmarus/flint)  and [quickstart](https://github.com/nmarus/flint/blob/master/quickstart/README.md).


# How to run your sparkbot

``` bash
// download the spark bot source code  
> git clone https://github.com/ObjectIsAdvantag/sparkbot-nodejs-starterkit
> cd sparkbot-nodejs-starterkit
> npm install

// launch your spark bot, default to port 8080
// note: your cisco spark token can be retreived by clicking on your account picture (upper right corner of the [developer documentation](https://developer.ciscospark.com/getting-started.htm))
> SPARK_TOKEN=XXXXXXXXXXXX node server.js
Cisco Spark bot started, running on port 8080

// open a second console, check your bot is running by hitting its health resource:
// GET https://sparkbot.localtunnel.me/
{ "message": "Your Cisco Spark bot is running", "webhook": "/webhook", "integration": "/integration", "localport": 8080 }

// if you're running your bot on a private network,
// install localtunnel
> npm install -g localtunnel

// launch a tunnel to localhost:8080
> lt -s sparkbot -p 8080
your url is: https://sparkbot.localtunnel.me

// check everything is running ok by hitting its health resource
// open in a web browser https://sparkbot.localtunnel.me/
// or via [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/ObjectIsAdvantag/smartproxy)
> bat https://sparkbot.localtunnel.me/
HTTP/1.1 200 OK
{
  "message": "Your Cisco Spark bot is running",
  "webhook": "/webhook",
  "integration": "/integration",
  "localport": 8080
}
```

# How to attach your bot to a Spark room

CiscoSpark defines 2 types of webhooks:

- HTTP webhooks : receive all events fired by a Spark Room, 'NewMessage' is the only event fired as of April 2016 (more coming),
- outgoing integrations : receive new message events fired by a Spark Room.

The bot proposed by the StarterKit proposes 2 endpoints /webhook and /integration so that you can pick one or another way to attach the bot to a Spark Room.


## attach via an HTTP webhook

Attaching an HTTP webhook to a Spark room is explained in the [Cisco Spark developer documentation](https://developer.ciscospark.com/webhooks-explained.html)

Quick setup:
- [lists your rooms](https://developer.ciscospark.com/endpoint-rooms-get.html), choose one, pick its room id,
- [add a webhook](https://developer.ciscospark.com/endpoint-webhooks-post.html) with a filter for the roomId above, and with a targetUrl pointing to your /webook endpoint, ex: https://sparkbot.localtunnel.me/webhook.

Take [DevNet Learning lab](https://learninglabs.cisco.com/lab/collab-sparkwebhook/step/1) for a step by step tutorial.


## attach via an outgoing integration

Outgoing integrations can be created directly from the Cisco Spark web client.
Note: you may also use the REST API /webhooks/outgoing resource.

Quick setup:
- launch the [Web client](https://web.ciscospark.com),
- pick a Room, look for the integrations pane on the right,
- create a new integration of type "outgoing webhook" with a targetUrl pointing to your bot /integration URI, ex: https://sparkbot.localtunnel.me/integration.


# Troubleshooting

For debugging purpose, you may want to use a WebAPI Traffic inspector.

If you 're looking for options, Windows users generally use [Fiddler](https://www.telerik.com/download/fiddler).

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
