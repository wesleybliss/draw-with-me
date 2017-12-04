import '../../styles/chat.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import * as chatActions from '../../redux/actions/chat'
import {
    wsSelector,
    nicknameSelector,
    rosterSelector,
    chatSelector
} from '../../redux/selectors'
import { push } from 'react-router-redux'
import * as Payloads from './payloads'

const mapStateToProps = state => {
    return {
        ws: wsSelector(state),
        nickname: nicknameSelector(state),
        roster: rosterSelector(state),
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

class Chat extends Component {
    
    displayName: 'Chat'
    
    state = {
        pendingMessage: ''
    }
    
    entryClassName = entry => 'nickname-' +
        (entry.incoming ? 'incoming' : 'outgoing')
    
    rosterToList = () =>
        this.props.roster
            .map((entry, index) => pug`
                li.list-group-item(key = index.toString())
                    | ${entry.nickname} 
                    | ${entry.nickname === this.props.nickname
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
        
        const { ws } = this.props
        const { nickname } = this.props
        const { pendingMessage } = this.state
        
        if (!pendingMessage || pendingMessage.length < 1)
            return console.warn('handleSendMessage', 'Message is empty')
        
        // @todo Not sure how to error check if the message actually sent
        this.props.ws.send(Payloads.NewMessage(nickname, pendingMessage))
        
        // Clear the message input
        this.setState({ pendingMessage: '' })
        
    }
    
    componentDidMount() {
        
        const { ws } = this.props
        
        // Add initial 'chat started' message
        if (this.props.chat.history.length < 1)
            this.props.actions.addHistory({
                incoming: null,
                nickname: '__system__',
                message: `** Chat Started @ ${new Date()} **`
            })
        
        // Don't trash paren't keepalive handler
        const parentOnMessageHandler = ws.onmessage
        ws.onmessage = event => {
            
            parentOnMessageHandler(event)
            
            if (event.data === 'PONG') return
            
            console.info('WS', 'Message:', event.data)
            
            let data = null
            
            try {
                data = JSON.parse(event.data)
            }
            catch (e) {
                console.error(e)
                console.warn('Error adding incoming message to history', data, typeof data)
                // @todo Better error reporting
                return console.error('Error adding incoming message to history', (typeof data, data))
            }
            
            if (data.request && data.request === 'IDENT') return
            
            // @todo Parent should handle this, but prob should check
            // for specific errors as well
            if (data.error) return
            
            if (data.roster)
                return this.props.actions.setRoster(data.roster)
            
            this.props.actions.addHistory({
                incoming: data.nickname === this.props.nickname,
                ...data
            })
            
        }
        
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
    
    }
    
    render() {
        
        const { pendingMessage } = this.state
        const { nickname } = this.props
        
        return pug`
            
            .container
                
                //- .row: .col: pre: code ${ JSON.stringify(this.props.chat, null, '    ') }
                
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
        
    }
    
}

// @todo Prob a better way to share props parent<->child
// w/out having to revalidate these
Chat.propTypes = {
    ws: PropTypes.object,
    nickname: PropTypes.string.isRequired,
    roster: PropTypes.array.isRequired,
    chat: PropTypes.shape({
        started: PropTypes.bool.isRequired,
        history: PropTypes.array.isRequired
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
