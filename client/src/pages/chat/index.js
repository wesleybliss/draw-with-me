import '../../styles/chat.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import * as chatActions from '../../redux/actions/chat'
import { onlineSelector, chatSelector } from '../../redux/selectors'
import ChatOnline from './chat-online'
import ChatOffline from './chat-offline'

const mapStateToProps = (state/*, ownProps*/) => {
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

class Chat extends Component {
    
    displayName: 'Chat'
    
    state = {
        nickname: ''
    }
    
    validateNickname = () =>
        this.state.nickname &&
        this.state.nickname.trim() &&
        !Array('__system__', '__debug__', '__test__')
            .includes(this.state.nickname)
    
    handleFormSubmitNickname = e => {
        e.preventDefault()
        if (!this.validateNickname()) {
            console.error('Invalid nickname')
            return window.alert('@todo notification -- invalid nickname')
        }
        // Update the store
        this.props.actions.setNickname(this.state.nickname)
        // Start the chat
        this.props.actions.setStarted(true)
        return false
    }
    
    handleChangeNickname = e =>
        this.setState({ nickname: e.target.value })
    
    componentDidMount() {
        
        if (this.props.chat.nickname)
            this.setState({ nickname: this.props.chat.nickname })
        
        window.WebSocket = window.WebSocket || window.MozWebSocket
        
        if (!window.WebSocket)
            return window.alert('It looks like your browser doesn\'t support WebSockets =(')
        
        const ws = new WebSocket('ws://0.0.0.0:8080')
        this.props.actions.setWs(ws)
        
        ws.onopen = () => {
            console.info('WS', 'Connected')
            this.props.actions.setOnline(true)
        }
        
        ws.onerror = err => {
            console.error('WS', err)
            this.props.actions.setWsError(err)
        }
        
    }
    
    render() {
        
        const { nickname } = this.state
        const { online, chat } = this.props
        
        const formNickname = pug`
            .row
                .col-4
                    form(onSubmit = this.handleFormSubmitNickname)
                        .form-group
                            label(for="nickname") Nickname
                            input#nickname.form-control(
                                ref = el => el && el.focus(),
                                type = "text",
                                placeholder = "",
                                value = nickname,
                                onChange = this.handleChangeNickname
                            )
                        button.btn.btn-primary(
                            onClick = this.handleFormSubmitNickname)
                            | Start Talking
                    `
        
        return pug`
            .row
                .col
                    h1 Chat
            .row
                .col
                    ${ !online && pug`ChatOffline` }
                    ${ online && !chat.started && pug`=formNickname` }
                    ${ online && chat.started && pug`ChatOnline` }
            
            //- .row
                .col
                    pre: code ${ JSON.stringify({
                        state: this.state,
                        props: this.props
                    }, null, '    ') }
            
            `
        
    }
    
}

Chat.propTypes = {
    online: PropTypes.bool.isRequired,
    chat: PropTypes.shape({
        ws: PropTypes.object,
        wsError: PropTypes.object,
        started: PropTypes.bool.isRequired,
        nickname: PropTypes.string.isRequired
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
