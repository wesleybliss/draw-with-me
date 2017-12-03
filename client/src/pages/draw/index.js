import '../../styles/chat.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
/*import DrawOnline from './draw-online'
import DrawOffline from './draw-offline'*/

const mapStateToProps = (state/*, ownProps*/) => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
        }
    }
}

class Draw extends Component {
    
    displayName: 'Draw'
    
    state = {
        foo: ''
    }
    
    componentDidMount() {
        
        
    }
    
    render() {
        
        return pug`
            .row
                .col
                    h1 Draw
            .row
                .col
                    p Hi
            
            `
        
    }
    
}

Draw.propTypes = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Draw)
