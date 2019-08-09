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
  // do something with your event here!
  console.log(event)
})
