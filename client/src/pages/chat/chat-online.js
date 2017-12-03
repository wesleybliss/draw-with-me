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

class ChatOnline extends Component {
    
    displayName: 'ChatOnline'
    
    // Works instead of getInitialState() { return { ... } }
    state = {
        
    }
    
    componentDidMount() {
        
        
        
    }
    
    render() {
        
        return pug`
            p Connected.
            `
        
    }
    
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatOnline)
