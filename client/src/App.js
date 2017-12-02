import './App.css'

import React, {Component} from 'react'

class App extends Component {
    render() {
        return pug`
            div.App
                .App-heading.App-flex
                    h2
                        | Welcome to 
                        span.App-react React
                .App-instructions.App-flex
                    img.App-logo(src = require('./react.svg'))
                    p
                        | Edit 
                        code src/App.js
                        |  and save to hot reload your changes.
            `
    }
}

export default App
