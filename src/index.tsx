import {Provider} from 'mobx-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import './index.css'
import observableMapStore from './stores/mapStore'

ReactDOM.render(
    <Provider mapStore={observableMapStore}>
        <App/>
    </Provider>,
    document.getElementById('root') as HTMLElement
)
