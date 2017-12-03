'use strict'

const chalk = require('chalk')
const WebSocket = require('ws')

const socketOpts = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080
}

process.title = 'node-chat'

// Logging
const _ = (...args) => console.log.apply(console, args)
const _l = _
const _d = (...args) => _(chalk.green(    'DEBUG'), ...args)
const _i = (...args) => _(chalk.cyan(     'INFO '), ...args)
const _w = (...args) => _(chalk.yellow(   'WARN '), ...args)
const _e = (...args) => _(chalk.red(      'ERROR'), ...args)
const _f = (...args) => _(chalk.magenta(  'WTF!?'), ...args)

let clients = []
let history = []

const wss = new WebSocket.Server(socketOpts, () =>
    _i(chalk.blue(`Listening on wss://${socketOpts.host}:${socketOpts.port}`)))

wss.broadcast = data => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
            client.send(
                (typeof data !== 'object')
                    ? data : JSON.stringify(data))
    })
}

const getRoster = () => {
    const users = []
    wss.clients.forEach(client => { users.push(client.user) })
    return users
}

const broadcastRoster = () => {
    getRoster().forEach(x => console.log(x))
    // Get users (excluding no-IDENT users)
    const roster = getRoster()
        .filter(u => !u.nickname.startsWith('__system__'))
    
    _i(chalk.yellow('OUTGOING'),
        'Roster (' + roster.length, 'users)')
    
    return wss.broadcast({ roster })
    
}

const validUser = ws => {
    
    if (ws.user.nickname &&
        !ws.user.nickname.startsWith('__system__'))
        return true
    
    ws.send(JSON.stringify({
        error: 'NOIDENT',
        message: 'You must identify yourself'
    }))
    
    return false
    
}

const handleIdent = (ws, data) => {
    // @todo Error checking for empty/invalid ident
    ws.user.nickname = data.nickname
    // Let everyone else know to update their roster
    broadcastRoster()
}

const handleRoster = (ws, data) => {
    const users = getRoster()
    _i(chalk.yellow('OUTGOING'), 'Roster (' + users.length, 'users)')
    ws.send(JSON.stringify({
        roster: users
    }))
}

const handleChat = (ws, event, data) => {
    
    switch (event) {
        case 'user.ident': return handleIdent(ws, data)
        case 'roster': return validUser(ws) && handleRoster(ws, data)
        case 'messages.new':
            if (validUser(ws)) {
                _i(chalk.yellow('BROADCAST'), JSON.stringify(data))
                // For now, broadcast to everyone - even the client that sent the message,
                // which will act as a soft-ACK, confirming the server received it
                /*wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN)
                        client.send(
                            (typeof data !== 'object')
                                ? data : JSON.stringify(data))
                })*/
                wss.broadcast(data)
            }
            return
    }
    
    _w('Unsupported chat event', event)
    return ws.send(JSON.stringify({
        error: `Unsupported chat event ${event}`
    }))
    
}

const handleDraw = (ws, event, data) => {
    _w('@todo handleDraw')
}

wss.on('connection', ws => {
    
    // Initially we don't know who this user
    // is until they identify themselves
    ws.user = {
        nickname: '__system__Unknown-' + Date.now()
    }
    
    _i('Client connected', ws.user)
    
    // A client disconnected
    ws.on('close', (code, reason) => {
        // Update client rosters
        broadcastRoster()
    })
    
    ws.on('message', message => {
        
        _i(chalk.green('INCOMING'), message)
        
        try {
            message = JSON.parse(message)
        }
        catch (e) {
            _w(e)
            return ws.send(JSON.stringify({
                error: 'Malformed payload - could not parse'
            }))
        }
        
        if (!message.event || !message.event.includes('.')) {
            _w('Malformed message')
            return ws.send(JSON.stringify({
                error: 'Malformed payload - must have "event" key'
            }))
        }
        
        let eventParts = message.event.split('.')
        const type = eventParts.shift()
        const event = eventParts.join('.')
        
        switch (type) {
            case 'chat': return handleChat(ws, event, message.data)
            case 'draw': return handleDraw(ws, event, message.data)
        }
        
        _w('Unsupported event', type, event)
        return ws.send(JSON.stringify({
            error: `Unsupported event ${type} ${event}`
        }))
        
        
        
        
        
        
        // IDENT request
        if (message.request && message.request === 'IDENT')
            return handleIdent(ws, message)
        
        if (!ws.user.nickname || ws.user.nickname.startsWith('__system__'))
            return ws.send(JSON.stringify({
                error: 'NOIDENT',
                message: 'You must identify yourself'
            }))
        
        if (message.request) {
            switch (message.request) {
                case 'roster':
                    const users = getRoster()
                    _i(chalk.yellow('OUTGOING'), 'Roster (' + users.length, 'users)')
                    return ws.send(JSON.stringify({
                        roster: users
                    }))
            }
        }
        
        _i(chalk.yellow('BROADCAST'), JSON.stringify(message))
        // For now, broadcast to everyone - even the client that sent the message,
        // which will act as a soft-ACK, confirming the server received it
        /*wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN)
                client.send(
                    (typeof message !== 'object')
                        ? message : JSON.stringify(message))
        })*/
        wss.broadcast(message)
        
    })
    
})
