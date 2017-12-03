import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import * as chatActions from '../../redux/actions/chat'
import { chatSelector } from '../../redux/selectors'

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
    
    historyToList = () =>
        this.props.chat.history
            .map((entry, index) => pug`
                 li.list-group-item(key = index.toString())
                    b(className = this.entryClassName(entry))
                        |${entry.nickname}: 
                    span ${entry.message}`)
    
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
            this.props.actions.addHistory({
                incoming: data.nickname === this.props.chat.nickname,
                ...data
            })
        }
        
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
                    p Chatting as ${ nickname }.
            
            .row
                .col-6
                    ul#chat-history.list-group
                        =${ this.historyToList() }
            
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
        history: PropTypes.array.isRequired
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatOnline)
