# node-outgoing-webhooks

A starter kit to build Spark Bots out of the Outgoing WebHook feature of the Cisco Spark Web Client.  

**Note that this kit leverages Outgoing Webhooks exposed by the Spark Web Client, which is not the traditionnal way to build a Spark bots.
Before spending too much thime here, make sure you have checked these nodejs Bot libraries that leverages the traditionnal Spark API Webhooks: [flint](https://github.com/nmarus/flint), [node-sparkbot](https://github.com/CiscoDevNet/node-sparkbot)**

New to Cisco Spark ?
- Spark is Cisco's Cloud Collaboration Services, which unifies team collaboration for the enterprise,
- start with the [Web Client](https://web.ciscospark.com/) (signup, enjoy the free chat service, with end to end securiy and integrated video).


## A bit of history 

This effort was started after [@CiscoDevNet SmartCity Paris](https://twitter.com/hashtag/devnethackathon) and @TADHack London hackathons, to bootstrap NodeJS Spark developers in minutes.

Therefore, the library is limited to very few dependencies and goal to keep them at a minimum (Express that's it).

Until July 2016, the library made it possible to support both traditional Webhooks and Outgoing integrations with the same programming interface.

With the introduction of the enhanced Spark Webhooks, this flexibility turned not to be sustainable. 


# Launch your bot in 60 seconds 

Read through the Quickstart hereafter, or jump to the [detailled guide](docs/BasicIntegrationSample.md)

``` bash
# In a 1st shell, install and launch your bot
# if you are running OSX 
#> sudo npm install express sparkbot-starterkit
# On windows
> npm install node-outgoing-webhooks
> cd node-outgoing-webhooks
> node tests/no-config.js
no configuration => starting up as an incoming integration...
Cisco Spark bot started on port: 8080

# In a 2nd bash shell, check your bot is healthy by hitting your sparkbot health resource:
# open in a web browser http://localhost:8080/ping/ 
# or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
# OSX devs: if localhost doesn't work for you, try 127.0.0.1
> curl http://localhost:8080/ping/
{"message":"Congrats, your bot is up and running","since":"2016-07-06T23:20:50.296Z","integrationURI":"/integration","webhookURI":null}

# Then expose your bot to the internet
> npm install -g localtunnel
> lt -s myawesomebot -p 8080
your url is: http://myawesomebot.localtunnel.me

# In a 3nd bash shell, check everything is running ok by hitting your sparkbot health resource
# open in a web browser https://myawesomebot.localtunnel.me/ping/ 
# or use a back command such as curl, [httpie](https://github.com/jkbrzt/httpie), or [bat](https://github.com/astaxie/bat)
> curl -v -X GET https://myawesomebot.localtunnel.me/ping
* ...
* NPN, negotiated HTTP1.1
* ...
* SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
* ...
HTTP/1.1 200 OK
{
    "message":"Congrats, your bot is up and running",
    "isWebhook":false,
    "isIntegration":true,
    "URI":"http://localhost:8080/integration"
}
```

# Then start sending Spark messages & commands to your bot

First step is to create the Outgoing integration: 
- launch the [Web client](https://web.ciscospark.com),
- pick a Room, look for the integrations pane on the right,
- create a new integration of type "Outgoing Webhook" with a targetUrl pointing to your bot /integration URI, ex: https://myawesomebot.localtunnel.me/integration.

_Note that an alternative would be to call the REST API Resource "/webhooks/outgoing" which is not documented though._


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
