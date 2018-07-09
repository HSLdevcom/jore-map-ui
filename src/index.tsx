import {Provider} from 'mobx-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import './index.css'
import observableMapStore from './stores/mapStore'
import observableSidebarStore from './stores/sidebarStore'

ReactDOM.render(
    <Provider
      mapStore={observableMapStore}
      sidebarStore={observableSidebarStore}
    >
        <App/>
    </Provider>,
    document.getElementById('root') as HTMLElement
)
