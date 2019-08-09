/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const debug = require('debug')('rrtc')
const io = require('socket.io-client')

/**
 * Establish the socket connection and set up event handlers for the standard
 * socket events. See https://socket.io/docs/client-api for descriptions of all
 * the events.
 *
 * @param opts
 * @returns {Socket} - https://socket.io/docs/client-api/#Socket
 */
module.exports = (opts) => {
  const namespace = opts.namespace

  const socketOptions = {
    query: {
      id: opts.queryId || '/',
    },
    transports: ['websocket'],
  }

  const socket = io(`${opts.url}/${namespace}`, socketOptions)

  // On connect, client must emit "auth" event with token to authenticate.
  socket.on('connect', () => {
    debug('%o', {namespace, event: 'socket:connect'})
    socket.emit('auth', opts.token)
  })

  socket.on('connect_error', (error) =>
    debug('%o', {namespace, event: 'socket:connect_error', error}))

  socket.on('connect_timeout', (timeout) =>
    debug('%o', {namespace, event: 'socket:connect_timeout', timeout}))

  socket.on('error', (error) =>
    debug('%o', {namespace, event: 'socket:error', error}))

  /*
   * On disconnect, socket will automatically try to reconnect, unless the
   * reason is "io server disconnect", in which case we try to reconnect
   * manually using the socket.connect
   * (https://socket.io/docs/client-api/#socket-connect) function.
   */
  socket.on('disconnect', (reason) => {
    debug('%o', {namespace, event: 'socket:disconnect', reason})

    if (reason === 'io server disconnect') {
      socket.connect();
    }
  })

  socket.on('reconnect', (attemptNumber) =>
    debug('%o', {namespace, event: 'socket:reconnect', attemptNumber}))

  socket.on('reconnecting', (attemptNumber) =>
    debug('%o', {namespace, event: 'socket:reconnecting', attemptNumber}))

  socket.on('reconnect_error', (error) =>
    debug('%o', {namespace, event: 'socket:reconnect_error', error}))

  socket.on('reconnect_failed', () =>
    debug('%o', {namespace, event: 'socket:reconnect_failed'}))

  socket.on('ping', () =>
    debug('%o', {namespace, event: 'socket:ping'}))

  socket.on('pong', (latency) =>
    debug('%o', {namespace, event: 'socket:pong', latency}))

  return socket
}
