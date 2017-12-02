import 'bootstrap/dist/css/bootstrap.css'
import './styles/index.styl'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './redux/store'
import App from './App'

const target = document.querySelector('#app')

render(
    pug`
        Provider(store = store)
            ConnectedRouter(history = history)
                App
    `,
    target
)
