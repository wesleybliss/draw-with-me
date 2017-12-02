import React from 'react'
/*import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'*/
import { connect } from 'react-redux'

window.WebSocket = window.WebSocket || window.MozWebSocket

if (!window.WebSocket) throw new Error('Client must support native WebSockets')

const wsc = new WebSocket('ws://0.0.0.0:8080')

wsc.onopen(() => )

/* eslint-disable */
const Chat = props => pug`
    div
        h1 Chat
        p Chat @todo.
    `

/* eslint-enable */

/*const mapDispatchToProps = dispatch => bindActionCreators({
    changePage: () => push('/about-us')
}, dispatch)*/

export default connect(
    null/*, 
    mapDispatchToProps*/
)(Chat)