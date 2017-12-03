import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import * as chatActions from '../../redux/actions/chat'
import { onlineSelector, chatSelector } from '../../redux/selectors'
import { push } from 'react-router-redux'
import * as Payloads from './payloads'

const mapStateToProps = state => {
    return {
        online: onlineSelector(state),
        chat: chatSelector(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
            ...bindActionCreators(appActions, dispatch),
            ...bindActionCreators(chatActions, dispatch)
        }
    }
}

class ChatOnline extends Component {
    
    displayName: 'ChatOnline'
    
    state = {
        reconnectTimeout: 3 * 1000, // Seconds
        reconnectTimer: -1,
        keepAliveTimeout: 5 * 1000, // Seconds
        keepAliveTimer: -1,
        pingPongTimeout: 4 * 1000,
        pingPongTimer: -1,
        pendingMessage: ''
    }
    
    connectionTimeout = () => {
        console.warn('Connection timed out', this.props)
        this.props.actions.setOnline(false)
        if (this.state.reconnectTimer < 1)
            this.state.reconnectTimer = window.setInterval(() => {
                if (this.props.online) {
                    console.info('Connection restored')
                    this.props.actions.setOnline(true)
                    return window.clearInterval(this.state.reconnectTimer)
                }
                console.info('Trying to reconnect')
                this.props.reconnect()
            }, this.state.reconnectTimeout)
    }
    
    entryClassName = entry => 'nickname-' +
        (entry.incoming ? 'incoming' : 'outgoing')
    
    rosterToList = () =>
        this.props.chat.roster
            .map((entry, index) => pug`
                li.list-group-item(key = index.toString())
                    | ${entry.nickname} 
                    | ${entry.nickname === this.props.chat.nickname
                            ? '*' : ''}
                `)
    
    historyToList = () =>
        this.props.chat.history
            .map((entry, index) => {
                
                let { nickname, message } = entry
                let alignedClasses = 'justify-content-end flex-column'
                
                if (entry.incoming === null)
                    alignedClasses += ' system'
                
                if (entry.incoming !== null)
                    alignedClasses += ' w-75'
                
                if (entry.incoming === false)
                    alignedClasses += ' align-self-end'
                
                if (entry.incoming === true)
                    alignedClasses += ' incoming'
                
                if (nickname.startsWith('__system__')) {
                    nickname = pug``
                }
                else {
                    nickname = pug`
                        b(className = this.entryClassName(entry))
                            | ${nickname}: `
                }
                
                return pug`
                    li.list-group-item.d-flex(
                        key = index.toString(),
                        className = alignedClasses
                    )
                        =${nickname}
                        span ${entry.message}`
                
            })
    
    handleChangePendingMessage = e =>
        this.setState({ pendingMessage: e.target.value })
    
    handleSendMessage = e => {
        
        if (e && e.preventDefault) e.preventDefault()
        
        const { ws } = this.props.chat
        const { nickname } = this.props.chat
        const { pendingMessage } = this.state
        
        if (!pendingMessage || pendingMessage.length < 1)
            return console.warn('handleSendMessage', 'Message is empty')
        
        // @todo Not sure how to error check if the message actually sent
        ws.send(Payloads.NewMessage(nickname, pendingMessage))
        
        // Clear the message input
        this.setState({ pendingMessage: '' })
        
    }
    
    componentDidMount() {
        
        const { ws } = this.props.chat
        
        // Add initial 'chat started' message
        if (this.props.chat.history.length < 1)
            this.props.actions.addHistory({
                incoming: null,
                nickname: '__system__',
                message: `** Chat Started @ ${new Date()} **`
            })
        
        ws.onmessage = event => {
            
            console.info('WS', 'Message:', event.data)
            
            if (event.data === 'PONG') {
                window.clearTimeout(this.state.keepAliveTimer)
                if (!this.props.online) this.props.actions.setOnline(true)
                this.state.keepAliveTimer = window.setTimeout(
                    this.connectionTimeout.bind(this), this.state.keepAliveTimeout)
                return
            }
            
            let data = null
            
            try {
                data = JSON.parse(event.data)
            }
            catch (e) {
                console.error(e)
                console.warn('Error adding incoming message to history', data, typeof data)
                // @todo Better error reporting
                return window.alert('Error adding incoming message to history')
            }
            
            if (data.request && data.request === 'IDENT')
                return
            
            if (data.roster)
                return this.props.actions.setRoster(data.roster)
            
            this.props.actions.addHistory({
                incoming: data.nickname === this.props.chat.nickname,
                ...data
            })
            
        }
        
        // Identify
        // @todo Kinda UDP here, not waiting for confirmation
        console.info('WS', 'Identifying as', this.props.chat.nickname)
        ws.send(Payloads.Ident(this.props.chat.nickname))
        
        // Request list of connected users
        console.info('WS', 'Requesting roster', { request: 'roster' })
        ws.send(Payloads.Roster())
        
        // Keep convo scrolled to bottom
        // @todo This prevents user from scrolling - needs override
        window.setInterval(() => {
            try {
                // If browser supports smooth scroll, use that
                this.refs.chatHistory
                    .childNodes[ch.childNodes.length - 1]
                    .scrollIntoView({ behavior: 'smooth' })
            }
            catch (e) {
                // Otherwise jump right to the end
                try {
                    this.refs.chatHistory.scrollTop = this.refs.chatHistory.scrollHeight
                }
                catch (e) {}
            }
        }, 1000)
        
        // Keepalive
        this.state.keepAliveTimer = window.setTimeout(
            this.connectionTimeout.bind(this), this.state.keepAliveTimeout)
        
        // Pingpong (force this to be 1s less than keepalive check)
        this.state.pingPongTimeout = this.state.keepAliveTimeout - 1000
        this.state.pingPongTimer = window.setInterval(() => {
            // console.info('PING')
            this.props.chat.ws.send('PING')
        }, this.state.pingPongTimeout)
        
    }
    
    render() {
        
        const { pendingMessage } = this.state
        const { wsError, nickname } = this.props.chat
        
        const errorView = pug`
            .alert.alert-danger ${ JSON.stringify(wsError, null, '    ') }
            `
        
        const chatView = pug`
            .row
                .col
                    p
                        | Chatting as ${ nickname }. 
                        button.btn.d-inline(onClick = () => window.location.reload()) ↻
            
            .row
                .col-8
                    h5 Conversation History
                    ul#chat-history.list-group(ref = "chatHistory")
                        =${ this.historyToList() }
                .col-4
                    h5 Users In This Chat
                    ul.list-group
                        =${ this.rosterToList() }
            
            .row.mt-2
                .col-8
                    form(onSubmit = this.handleSendMessage)
                        .form-group
                            input.form-control(
                                ref = el => el && el.focus(),
                                type = "text",
                                placeholder = "What's on your mind?",
                                value = pendingMessage,
                                onChange = this.handleChangePendingMessage
                            )
                        button.btn.btn-success(
                            onClick = this.handleSendMessage)
                            | Start Talking
            `
        
        return pug`
            ${ wsError && pug`=errorView` }
            ${ !wsError && pug`=chatView` }
            `
        
    }
    
}

// @todo Prob a better way to share props parent<->child
// w/out having to revalidate these
ChatOnline.propTypes = {
    chat: PropTypes.shape({
        ws: PropTypes.object,
        wsError: PropTypes.object,
        started: PropTypes.bool.isRequired,
        nickname: PropTypes.string.isRequired,
        roster: PropTypes.array.isRequired,
        history: PropTypes.array.isRequired
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatOnline)
