const WebSocket = require('ws')

const WebSocketServer = new WebSocket.Server({ port: 3030})

const users = []

const broadcast = (data, ws) => {
  WebSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
      client.send(JSON.stringify(data))
    }
  })
}

WebSocketServer.on('connection', (ws) => {
  let index
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    switch (data.type) {
      case 'ADD_USER': {
        index = users.length
        users.push({name: data.name, id: index + 1})
        ws.send(JSON.stringify({
          type: 'USERS_LIST',
          users
        }))
        broadcast({
          type: 'USERS_LIST',
          users
        }, ws)
        break
      }
      case 'ADD_MESSAGE':
        broadcast({
          type: 'ADD_MESSAGE',
          message: data.message,
          author: data.author
        }, ws)
        break
      default:
        break
    }
  })

  ws.on('closed', () => {
    users.splice(index,1)
    broadcast({
      type: 'USERS_LIST',
      users
    }, ws)
  })
})