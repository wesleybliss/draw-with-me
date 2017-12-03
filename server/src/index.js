'use strict'

const chalk = require('chalk')
const WebSocket = require('ws')

const socketOpts = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080
}

process.title = 'node-chat'

let clients = []
let history = []

// Array with some colors
let colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ]
// ... in random order
colors.sort((a, b) => Math.random() > 0.5)

const wss = new WebSocket.Server(socketOpts, () =>
    console.info(chalk.blue(`Listening on wss://${socketOpts.host}:${socketOpts.port}`)))

wss.broadcast = data => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
          client.send(data)
    })
}

wss.on('connection', ws => {
    
    console.info('Connection from', ws)
    
    console.info(chalk.yellow('OUTGOING'), 'Hello')
    ws.send('Hello')
    
    ws.on('message', message => {
        
        console.info(chalk.green('INCOMING'), message)
        
        console.info(chalk.yellow('BROADCAST'), JSON.stringify(message))
        wss.clients.forEach(client => {
            /*if (client !== ws && client.readyState === WebSocket.OPEN)*/
                client.send(message)
        })
        
    })
    
})

// Called whenever a client connects
/*wss.on('request', request => {
    
    console.log((new Date()), 'Connection from', request.origin)
    
    // @todo CORS check
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    const connection = request.accept(null, request.origin) 
    
    // Keep track of the client's index to remove them on 'close' event
    const index = clients.push(connection) - 1
    
    let userName = false
    let userColor = false
    
    console.log((new Date()) + ' Connection accepted.')
    
    // Send back chat history
    if (history.length > 0)
        connection.sendUTF(JSON.stringify({ type: 'history', data: history }))
    
    // Client sent a message
    connection.on('message', function(message) {
        
        if (message.type === 'utf8') {
            
            if (userName === false) {
                
                // First message sent by user should be their name
                
                userName = message.utf8Data
                userColor = colors.shift()
                
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }))
                
                console.info(new Date(), 'User is known as:', userName, 'in', userColor)
                
            }
            else {
                
                // Log and broadcast the message
                
                console.log(new Date(), 'Received Message from', userName + ': ', message.utf8Data)
                
                // Save message to history
                const historyEntry = {
                    time: new Date().getTime(),
                    text: message.utf8Data,
                    author: userName,
                    color: userColor
                }
                
                history.push(historyEntry)
                history = history.slice(-100)
                
                // Broadcast message to all connected clients
                const json = JSON.stringify({ type:'message', data: historyEntry })
                
                clients.forEach(x => x.sendUTF(json))
                
            }
            
        }
        
    })
    
    // User disconnected
    connection.on('close', connection => {
        
        if (userName !== false && userColor !== false) {
            console.info(new Date(), 'Peer', connection.remoteAddress, 'disconnected')
            // Remove user from the list of connected clients
            clients.splice(index, 1)
            // Push back user's color to be reused by another user
            colors.push(userColor)
        }
        
    })
    
})*/
