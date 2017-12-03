import './styles/App.styl'

import React, {Component} from 'react'
import { Route, Link } from 'react-router-dom'
import Home from './pages/home'
import Chat from './pages/chat'
import Draw from './pages/draw'

import Navbar from './components/navbar'

class App extends Component {
    render() {
        return pug`
            .App
                Navbar
                .container.mt-4
                    Route(exact=true, path="/", component=Home)
                    Route(exact=true, path="/chat", component=Chat)
                    Route(exact=true, path="/draw", component=Draw)
            `
    }
}

export default App
