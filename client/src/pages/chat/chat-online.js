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
        
    }
    
    componentDidMount() {
        
        const { ws } = this.props.chat
        
        ws.onmessage = data => {
            console.info('WS', 'Message:', data)
            // @todo
        }
        
    }
    
    render() {
        
        const { wsError, nickname } = this.props.chat
        
        const errorView = pug`
            .alert.alert-danger ${ JSON.stringify(wsError, null, '    ') }
            `
        
        const chatView = pug`
            p Chatting as ${ nickname }.
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
        nickname: PropTypes.string.isRequired
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatOnline)
