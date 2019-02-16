<p align="center">
    <a href="https://webhookrelay.com" target="_blank"><img width="100"src="https://webhookrelay.com/images/sat_logo.png"></a>
</p>

[![Build Status](https://drone-kr.webrelay.io/api/badges/webhookrelay/webhookrelay-ws-client/status.svg)](https://drone-kr.webrelay.io/webhookrelay/webhookrelay-ws-client)

## Problem

Ubiquitous HTTP protocol allows any application to talk to any other application over the network. However, sometimes applications are behind firewalls, routers that don't do NAT, or just don't have an HTTP server at all. In this case applications would have to do HTTP polling that is slower and more resource intensive task.

## Solution

 Webhook Relay WebSocket client allows applications to receive webhooks without public IP, configuring NAT/firewall or even having a web server in the first place. It does this by creating a WebSocket connection to Webhook Relay public SaaS: https://webhookrelay.com/v1/guide/. Each user gets their public HTTP endpoints where they can configure routing (other public endpoints, [relayd agents](https://webhookrelay.com/download/), or WebSocket clients) 

## Installation

```
npm i webhookrelay-ws-client
```

## Usage

To start using this library:

1. Retrieve your tokens from [Webhook Relay tokens page](https://my.webhookrelay.com/tokens). You will need to supply them to the library.
2. [Create a bucket](https://my.webhookrelay.com/buckets) called 'nodered' and check what input URL did you get (should be something like: `https://my.webhookrelay.com/v1/webhooks/...`). Input URL will be your own inbox that you can supply to any other application to send webhooks or any other HTTP requests to.
3. Import into your application:

```javascript
var ws = require(`webhookrelay-ws-client`);

// handler function has to accept a JSON string and parse on its own
var handler = function (data) {
    console.log(data)
}

// create a client with specified token key and secret from https://my.webhookrelay.com/tokens and any buckets that
// can be created here https://my.webhookrelay.com/buckets. Handler function is called whenever there's a new message
var client = new ws.WebhookRelayClient('your-token-key', 'your-token-secret', ['bucket-1', 'bucket-2'], handler)

// connect starts a websocket connection to Webhook Relay 
client.connect();
```

### Example application

Set tokens as environment variables:

```bash
export RELAY_KEY=[YOUR TOKEN KEY]
export RELAY_SECRET=[YOUR TOKEN SECRET]
```

```javascript
// app.js
var ws = require(`webhookrelay-ws-client`);

var apiKey = process.env.RELAY_KEY;
var apiSecret = process.env.RELAY_SECRET;

var handler = function (data) {
    console.log(data)
}

var run = function () {    
    var client = new ws.WebhookRelayClient(apiKey, apiSecret, ['nodered'], handler)
    client.connect();

    // do some work

    // disconnect whenever connection is no longer needed
    setTimeout(function(){ 
        console.log('disconnecting')
        client.disconnect();
    }, 10000);
}

run();
```

To run it:

```bash
node app.js
```

Now, whenever you send webhooks to your public endpoint `https://my.webhookrelay.com/v1/webhooks/<your input ID>`, they will be received inside your application. You can subscribe to multiple buckets. Each message will have a JSON string that you can parse:

```javascript
{
  "type": "webhook",             // event type
  "meta": {                      // bucket, input and output information 
    "bucked_id": "1593fe5f-45f9-45cc-ba23-675fdc7c1638", 
    "bucket_name": "my-1-bucket-name",                                
    "input_id": "b90f2fe9-621d-4290-9e74-edd5b61325dd",
    "input_name": "Default public endpoint",
    "output_name": "111",
		"output_destination": "http://localhost:8080"
  },
  "headers": {                   // request headers
    "Content-Type": [
      "application/json"
    ]
  },
  "query": "foo=bar",            // query (ie: /some-path?foo=bar)
  "body": "{\"hi\": \"there\"}", // request body
  "method": "PUT"                // request method
}
```
