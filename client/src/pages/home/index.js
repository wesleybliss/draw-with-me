import React from 'react'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const Home = props => (pug`
    div
        h1 Home
        p Welcome home!
        button(onClick=() => props.changePageChat()) Go to text chat
    `
)

const mapDispatchToProps = dispatch => bindActionCreators({
    changePageChat: () => push('/chat')
}, dispatch)

export default connect(
    null, 
    mapDispatchToProps
)(Home)
