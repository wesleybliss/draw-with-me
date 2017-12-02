import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import { onlineSelector } from '../../redux/selectors'

const mapStateToProps = state => {
    return {
        online: onlineSelector(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        /*setStatus: status => dispatch(setStatus(status))*/
        actions: bindActionCreators(appActions, dispatch)
    }
}

class Chat extends Component {
    
    displayName: 'Chat'
    
    state = {
        msg: ''
    }
    
    changeMessage() {
        this.setState({ msg: 'suuuupp' })
    }
    
    componentDidMount() {
        this.setState({ msg: 'heyo' })
        console.log(this.state)
        window.setTimeout(function() {
            this.setState({ online: true })
        }.bind(this), 1000)
    }
    
    render() {
        return pug`
            h1 Chat
            p Foo bar biz bat
            p msg: ${this.state.msg}
            ${ this.state.online && pug`p ONLINE` }
            button(onClick=this.changeMessage.bind(this)) Click Me
            `
    }
    
}

Chat.propTypes = {
    online: PropTypes.bool.isRequired/*,
    msg: PropTypes.string*/
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
