import React from 'react'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const Home = props => (
    <div>
        <h1>Home</h1>
        <p>Welcome home!</p>
        <button onClick={() => props.changePageAbout()}>Go to about page via redux</button>
        <button onClick={() => props.changePageChat()}>Go to text chat</button>
    </div>
)

const mapDispatchToProps = dispatch => bindActionCreators({
    changePageAbout: () => push('/about-us'),
    changePageChat: () => push('/chat')
}, dispatch)

export default connect(
    null, 
    mapDispatchToProps
)(Home)