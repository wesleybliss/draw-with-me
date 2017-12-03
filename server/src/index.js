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

const getRoster = () => {
    const users = []
    wss.clients.forEach(client => { users.push(client.user) })
    return users
}

const broadcastRoster = () => {
    
    // Get users (excluding no-IDENT users)
    const users = getRoster()
        .filter(u => !u.nickname.startsWith('__system__'))
    
    console.info(chalk.yellow('OUTGOING'),
        'Roster (' + users.length, 'users)')
    
    return wss.broadcast(JSON.stringify({
        roster: users
    }))
    
}

wss.on('connection', ws => {
    
    // console.info('Connection from', ws)
    console.info('Client connected')
    
    // Initially we don't know who this user
    // is until they identify themselves
    ws.user = {
        nickname: '__system__Unknown-' + Date.now()
    }
    
    // console.info(chalk.yellow('OUTGOING'), 'Hello')
    // ws.send('Hello')
    
    // A client disconnected
    ws.on('close', (code, reason) => {
        // Update client rosters
        broadcastRoster()
    })
    
    ws.on('message', message => {
        
        console.info(chalk.green('INCOMING'), message)
        
        try {
            message = JSON.parse(message)
        }
        catch (e) {
            console.warn(e)
            return ws.send(JSON.stringify({
                error: 'Malformed payload - could not parse'
            }))
        }
        
        // IDENT request
        if (message.request && message.request === 'IDENT') {
            // @todo Error checking for empty/invalid ident
            ws.user.nickname = message.data
            // Let everyone else know to update their roster
            broadcastRoster()
        }
        
        if (!ws.user.nickname || ws.user.nickname.startsWith('__system__'))
            return ws.send(JSON.stringify({
                error: 'NOIDENT',
                message: 'You must identify yourself'
            }))
        
        if (message.request) {
            switch (message.request) {
                case 'roster':
                    const users = getRoster()
                    console.info(chalk.yellow('OUTGOING'),
                        'Roster (' + users.length, 'users)')
                    return ws.send(JSON.stringify({
                        roster: users
                    }))
            }
        }
        
        console.info(chalk.yellow('BROADCAST'), JSON.stringify(message))
        // For now, broadcast to everyone - even the client that sent the message,
        // which will act as a soft-ACK, confirming the server received it
        wss.clients.forEach(client => {
            if (/*client !== ws &&*/ client.readyState === WebSocket.OPEN)
                client.send(
                    (typeof message !== 'object')
                        ? message : JSON.stringify(message))
        })
        
    })
    
})
