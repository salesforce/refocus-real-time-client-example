# refocus-real-time-client-example

This Refocus Real-Time Client Example application connects to your Refocus Real-Time application, authenticates using your API token, and sets up event handlers for all the standard socket events and all the Refocus Real-Time events associated with the namespace and query you provide.

In this example, the events just stream to the console using debug, but obviously you could build a client application which uses the event stream in more interesting ways (e.g. logging, persistence, metrics, more complex processing, etc.).

## Installation

```
git clone https://github.com/salesforce/refocus-real-time-client-example
cd refocus-real-time-client-example
npm install
```

## Configuration

In order to connect to your Refocus Real-Time application, you must set these environment variables:

| Name | Required | Default | Description |
| --- | :---: | :---: | --- |
| DEBUG | false | * | The debug scope. Set the value to "rrtc" for basic output and/or "rrtc:verbose" for more verbose output (includes the full message for every event). Supports comma-delimited list of debug scopes (e.g. "rrtc,rrtc:verbose") and wildcards (e.g. "rrtc*"). |
| NAMESPACE | true | | The namespace to connect to. Must be one of "bots", "perspectives" or "rooms". |
| QUERY_ID | true | / | The query you want to use to filter the events. If you want to receive *all* events (i.e. no filter) then set the value to "/" (default). |
| REAL_TIME_URL | true | | The URL of your Refocus Real-Time application. |
| REFOCUS_TOKEN | true | | A valid API token for your Refocus application. |

##### QUERY_ID for perspectives

For the "perspectives" namespace, the QUERY_ID allows you to filter by root subject, include/exclude subject tags, include/exclude aspect tags, include/exclude aspect names, and include/exclude sample statuses.

The easiest way to construct this filter is start from a Refocus perspective. Load that perspective in your browser. If you are using Chrome, go to *Developer Tools*, go to the *Network* tab, then click *WS* to see just the websocket request. Right-click on the *refocus-real-time* request and copy the link address. Grab the value of the `id` query parameter, i.e. everything between "&id=" and "&EIO=".

Note: you will have to *decode* the url encoding:
- replace `%2F` with `/`
- replace `%26` with `&`
- replace `%3D` with `=`
- replace `%3B` with `;`    

## Start

Once you have set your environment variables, start the application and start watching your logs!

```
npm start
```

------

## The Smallest, Simplest "Hello, World" Refocus Real-Time Client Application

```javascript
const io = require('socket.io-client')

const url = '[YOUR REFOCUS REAL TIME URL]'
const token = '[YOUR REFOCUS TOKEN]'
const namespace = 'perspectives'

const socketOptions = {
  query: {
    id: '/',
  },
  transports: ['websocket'],
}

const socket = io(`${url}/${namespace}`, socketOptions)

socket.on('connect', () => socket.emit('auth', token))

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') socket.connect();
})

socket.on('refocus.internal.realtime.sample.update', (event) => {
  console.log(event)
})
```
