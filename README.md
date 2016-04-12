# CiscoSpark NodeJS Starter Kit

StarterKit to hack a CiscoSpark bot, with minimal dependencies (NodeJS, Express)

Quick setup :
- install localtunnel in order to make visible your bot on the internet,
- run the sparkbot
- attach it to a Room
- [optional] troubleshooting

# how to run

``` bash
// install localtunnel
> npm install -g localtunnel

// launch a tunnel to local port 8080
> lt -s sparkbot -p 8080
// your bot is now exposed publically at https://sparkbot.localtunnel.me/

// download the spark bot nodejs code  
> git clone <repo>
> cd <repo>
> npm install

// time to launch your bot on port 8080
> SPARK_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXxXXXXX node server.js
```

# attach to a Spark Room

CiscoSpark defines 2 types of webhooks:

- HTTP webhooks : receive all events fired by a Spark Room, 'NewMessage' is the only event fired as of April 2016 (more coming),
- outgoing integrations : receive new message events fired by a Spark Room.

The bot proposed by the SarterKit proposes 2 endpoints /webhook and /integration so that you can pick one or another way to attach it to a Spark Room.


## via HTTP webhooks

Attaching an HTTP webhook to a Spark room is explained in the [Cisco Spark developer documentation](https://developer.ciscospark.com/webhooks-explained.html)

Quick setup:
- [lists your rooms](https://developer.ciscospark.com/endpoint-rooms-get.html), choose one, pick its room id,
- [add a webhook](https://developer.ciscospark.com/endpoint-webhooks-post.html) with a filter for the roomId above, and with a targetUrl pointing to your /webook endpoint, ex: https://sparkbot.localtunnel.me/webhook.

Take [DevNet Learning lab](https://learninglabs.cisco.com/lab/collab-sparkwebhook/step/1) for a step by step tutorial.


## via an outgoing integration

An outgoing integration is created directly from the Cisco Spark web client.

Quick setup:
- launch the [Web client](https://web.ciscospark.com),
- pick a Room, look for the integrations page on the right,
- create a new integration of type "outgoing webhook" with a targetUrl pointing to your /integration endpoint, ex: https://sparkbot.localtunnel.me/integration.

# troubleshooting

For debugging purpose, you may want to run a WebAPI Traffic inspector.

We suggest Fiddler on Windows.

If you wanna try an experimental #golang traffic capture tool, try smartproxy.
Simply [pick a binary](https://github.com/ObjectIsAdvantag/smartproxy/releases/tag/v0.4) for your platform, and run it

``` bash
// download binary, rename it, set as executable, launch
> mv smartproxy.mac smartproxy
> chmod 755 smartproxy
> ./smartproxy --capture
// by default port 9090 gets forwarded to port 8080
// go to http://localhost:9090/traffic to see incomin traffic
// select an HTTP req/response
// look at your console to get the req and resp answers

// then launch a tunnel to local port 9090
> lt -s sparkbot -p 9090
// your bot is now exposed publically at https://sparkbot.localtunnel.me/

// time to launch your bot on port 8008
> SPARK_TOKEN=XXXXXXXXXX node server.js
```
