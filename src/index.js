/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const debug = require('debug')('rrtc')
const verbose = require('debug')('rrtc:verbose')
const onDeath = require('death')
const sizeof = require('object-sizeof')
const connect = require('./connect')

// Load the list of namespaces and their associated event types
const namespaceEvents = require('./namespaceEvents')
const namespaces = Object.keys(namespaceEvents)

const opts = {
  url: process.env.REAL_TIME_URL,
  token: process.env.REFOCUS_TOKEN,
  namespace: process.env.NAMESPACE,
  queryId: process.env.QUERY_ID || '/',
}

/**
 * Verify that we have all the required environment variables.
 *
 * @param opts
 * @throws {Error}
 */
function validate(opts) {
  const arr = []
  if (!opts.url) arr.push('Missing env var REAL_TIME_URL.')
  if (!opts.token) arr.push('Missing env var REFOCUS_TOKEN.')
  if (!opts.namespace) arr.push('Missing env var NAMESPACE.')
  if (opts.namespace && !namespaces.includes(opts.namespace))
    arr.push(`Invalid NAMESPACE "${opts.namespace}" (must be one of [${namespaces}])`)
  if (arr.length) {
    throw new Error(['Cannot start refocus-real-time-client-example:'].concat(arr).join('\n  '));
  }
} // validate

/**
 * Establish the connection to the Refocus Real-Time application and add a
 * handler for the events associated with the specified namespace.
 *
 * @param opts
 */
function start(opts) {
  debug('Connecting to %s namespace "%s" with query id "%s"', opts.url,
    opts.namespace, opts.queryId)
  const socket = connect(opts)

  namespaceEvents[opts.namespace].forEach(eventType => {
    debug('Handling namespace "%s" event "%s"', opts.namespace, eventType)

    socket.on(eventType, (event) => {
      // Note: the event is transmitted as a string
      const jsonEvent = JSON.parse(event)
      const size = sizeof(jsonEvent)

      const obj = { namespace: opts.namespace, event: eventType, size}
      if (eventType === 'refocus.internal.realtime.sample.update') {
        obj.name = jsonEvent['refocus.internal.realtime.sample.update'].new.name
      } else if (eventType === 'refocus.internal.realtime.sample.nochange') {
        obj.name = jsonEvent['refocus.internal.realtime.sample.nochange'].name
      }

      debug('%o', obj)

      obj.message = jsonEvent[eventType]
      verbose('%o', obj)
    })
  })

  // Disconnect socket connection before exiting
  onDeath((signal) => {
    socket.disconnect()
    debug('Process terminated with signal %s', signal)
  })
} // start

try {
  validate(opts)
  start(opts)
} catch (error) {
  console.error(error.message)
}
