import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import { onlineSelector } from '../../redux/selectors'

console.log('appActions', appActions)

const mapStateToProps = state => {
    return {
        
    }
}

const mapDispatchToProps = dispatch => {
    return {
        
    }
}

class ChatOffline extends Component {
    
    displayName: 'ChatOffline'
    
    // Works instead of getInitialState() { return { ... } }
    state = {
        
    }
    
    componentDidMount() {
        
        
        
    }
    
    render() {
        
        return pug`
            p It appears you're offline.
            p Trying to reconnect now...
            `
        
    }
    
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatOffline)
