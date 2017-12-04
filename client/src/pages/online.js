// import '../../styles/chat.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../redux/actions/app'
import {
    wsSelector,
    wsErrorSelector,
    onlineSelector,
    nicknameSelector
} from '../redux/selectors'
import * as Payloads from './chat/payloads'
import Chat from './chat'
import Draw from './draw'

const mapStateToProps = (state/*, ownProps*/) => {
    return {
        ws: wsSelector(state),
        wsError: wsErrorSelector(state),
        online: onlineSelector(state),
        nickname: nicknameSelector(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
            ...bindActionCreators(appActions, dispatch)
        }
    }
}

class Online extends Component {
    
    displayName: 'Online'
    
    state = {
        reconnectInterval: 3 * 1000,
        reconnectTimer: -1,
        keepAliveTimeout: 5 * 1000, // Seconds
        keepAliveTimer: -1,
        pingPongTimeout: 4 * 1000,
        pingPongTimer: -1,
        nickname: ''
    }
    
    handleWsError = e => {
        
        console.error('WS', e)
        
        this.props.actions.setWsError(
            typeof e === 'string' ? e : JSON.stringify(e))
        
        if (this.state.reconnectTimer < 1)
            this.state.reconnectTimer = window.setInterval(
                this.connectWs, this.state.reconnectInterval)
        
    }
    
    handleWsOpen = e => {
        
        console.info('WS', 'Connected', e)
        
        if (this.props.ws.readyState === 1) {
            
            console.info('WS', 'Connected, online')
            
            window.clearInterval(this.state.reconnectTimer)
            
            this.props.actions.setWsError(null)
            this.props.actions.setOnline(true)
            
            this.keepAlive()
            
        }
        
    }
    
    handleWsMessage = e => {
        
        if (e.data === 'PONG') {
            
            // console.log('Clearing this.state.keepAliveTimer', this.state.keepAliveTimer)
            window.clearTimeout(this.state.keepAliveTimer)
            
            if (!this.props.online) this.props.actions.setOnline(true)
            
            this.state.keepAliveTimer = window.setTimeout(
                this.connectionTimeout, this.state.keepAliveTimeout)
            
            return
            
        }
        
        if (e.data) try {
            
            const data = JSON.parse(e.data)
            
            if (data.error) {
                
                switch (data.error) {
                    
                    case 'NOIDENT': return this.identify()
                    
                    default:
                        console.warn('Unknown error received', data)
                    
                }
                
            }
            
            return
            
        }
        catch (e) {}
        
    }
    
    connectionTimeout = () => {
        
        console.warn('Connection timed out', this.props)
        this.props.actions.setOnline(false)
        
        if (this.state.reconnectTimer < 1)
            this.state.reconnectTimer = window.setInterval(() => {
                if (this.props.online === true &&
                    this.props.chat.ws.readyState < 2) {
                    console.info('Connection restored')
                    // this.props.actions.setOnline(true)
                    return window.clearInterval(this.state.reconnectTimer)
                }
                console.info('Trying to reconnect')
                this.connectWs()
            }, this.state.reconnectInterval)
        
    }
    
    identify = () => {
        // @todo Kinda UDP here, not waiting for confirmation
        console.info('WS', 'Identifying as', this.state.nickname)
        this.props.ws.send(Payloads.Ident(this.state.nickname))
    }
    
    keepAlive = () => {
        
        // Pingpong (force this to be 1s less than keepalive check)
        this.state.pingPongTimeout = this.state.keepAliveTimeout - 1000
        if (this.state.pingPongTimer < 1)
            this.state.pingPongTimer = window.setInterval(() => {
                // console.info('PING')
                if (this.props.ws.readyState === 1)
                    this.props.ws.send('PING')
            }, this.state.pingPongTimeout)
        
        // Send initial PING
        if (this.props.ws.readyState === 1)
            this.props.ws.send('PING')
        
    }
    
    connectWs = () => {
        
        console.info('connectWs')
        
        if (this.props.ws && Array(0, 1, 2).includes(this.props.ws.readyState))
            return
        
        window.WebSocket = window.WebSocket || window.MozWebSocket
        
        if (!window.WebSocket)
            return window.alert('It looks like your browser doesn\'t support WebSockets =(')
        
        try {
            const ws = new WebSocket('ws://0.0.0.0:8080')
            this.props.actions.setWs(ws)
            ws.onopen = this.handleWsOpen
            ws.onerror = this.handleWsError
            ws.onmessage = this.handleWsMessage
        }
        catch (e) {
            this.handleWsError(e)
        }
        
    }
    
    isOnline = () => !this.props.wsError && this.props.online === true
    isReady = () => this.isOnline() && this.props.nickname && this.props.nickname.trim()
    
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
        // IDENT
        this.identify()
    }
    
    handleChangeNickname = e =>
        this.setState({ nickname: e.target.value })
    
    componentDidMount() {
        
        if (this.props.nickname)
            this.setState({ nickname: this.props.nickname })
        
        this.connectWs()
        
        // Keepalive
        if (this.state.keepAliveTimer < 1)
            this.state.keepAliveTimer = window.setTimeout(
                this.connectionTimeout.bind(this), this.state.keepAliveTimeout)
        
    }
    
    render() {
        
        const { id } = this.props.match.params
        const { wsError } = this.props
        const { nickname } = this.state
        
        const errorView = pug`
            .row: .col: .alert.alert-danger
                | ${ JSON.stringify(wsError, null, '    ') }`
        
        const offlineView = pug`
            p It appears you're offline.
            p Trying to reconnect now...`
        
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
            
            //- .row
                .col
                    h1 Online (${ id })
                    p: pre: code ${ JSON.stringify(this.props, null, '    ') }
            
            //- Show errors, if any
            ${ wsError && pug`=errorView` }
            
            // Not connected
            ${ !this.isOnline() && pug`=offlineView` }
            
            // Connected, but hasn't entered a nickname/etc.
            ${ this.isOnline() && !this.isReady() && pug`=formNickname` }
            
            //- Show appropriate view based on route ID
            ${ this.isReady() && id === 'chat' && pug`Chat` }
            ${ this.isReady() && id === 'draw' && pug`Draw` }
            
        `
        
    }
    
}

// @todo Prob a better way to share props parent<->child
// w/out having to revalidate these
Online.propTypes = {
    ws: PropTypes.object,
    wsError: PropTypes.node,
    online: PropTypes.bool.isRequired,
    nickname: PropTypes.string.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Online)
