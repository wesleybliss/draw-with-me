import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import * as chatActions from '../../redux/actions/chat'
import { chatSelector } from '../../redux/selectors'
import { push } from 'react-router-redux'

const mapStateToProps = state => {
    return {
        chat: chatSelector(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
            ...bindActionCreators(chatActions, dispatch)
        }
    }
}

class ChatOnline extends Component {
    
    displayName: 'ChatOnline'
    
    state = {
        pendingMessage: ''
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
                
                if (nickname.startsWith('__system__')) {
                    nickname = pug``
                }
                else {
                    nickname = pug`
                        b(className = this.entryClassName(entry))
                            | ${nickname}: `
                }
                
                return pug`
                    li.list-group-item(key = index.toString())
                        =${nickname}
                        span ${entry.message}`
                
            })
    
    handleChangePendingMessage = e =>
        this.setState({ pendingMessage: e.target.value })
    
    handleSendMessage = e => {
        
        if (e && e.preventDefault) e.preventDefault()
        
        console.log('handleSendMessage', this.state.pendingMessage)
        
        const { nickname } = this.props.chat
        const { pendingMessage } = this.state
        
        if (!pendingMessage || pendingMessage.length < 1) {
            console.warn('handleSendMessage', 'Message is empty')
            return false
        }
        
        const payload = {
            nickname,
            message: pendingMessage
        }
        
        // @todo Not sure how to error check if the message actually sent
        this.props.chat.ws.send(JSON.stringify(payload))
        
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
        ws.send(JSON.stringify({
            request: 'IDENT',
            data: this.props.chat.nickname
        }))
        
        // Request list of connected users
        console.info('WS', 'Requesting roster', { request: 'roster' })
        ws.send(JSON.stringify({
            request: 'roster'
        }))
        
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
                .col-6
                    h5 Conversation History
                    ul#chat-history.list-group
                        =${ this.historyToList() }
                .col-4
                    h5 Users In This Chat
                    ul.list-group
                        =${ this.rosterToList() }
            
            .row.mt-2
                .col-6
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
