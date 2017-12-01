/* eslint-disable */

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './redux/store'
import App from './containers/app'
import template from './index.pug'
import registerServiceWorker from './registerServiceWorker';

import './css/index.css'

const target = document.querySelector('#root')

/*
<Provider store={store}>
        <ConnectedRouter history={history}>
            <div>
                <App />
            </div>
        </ConnectedRouter>
    </Provider>
*/

render(
    pug`
        Provider(store = store)
            ConnectedRouter(history = history)
                div
                    App
    `,
    target
)

registerServiceWorker()
