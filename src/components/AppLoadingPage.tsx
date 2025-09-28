import { inject, observer } from 'mobx-react'
import React from 'react'
import { getText } from '~/utils/textUtils'
import * as s from './appLoadingPage.scss'

type AppState = 'isLoading' | 'hasBackendConnectionError' | 'isLoggingIn'
interface IAppLoadingPageProps {
  state: AppState
}
const AppLoadingPage = inject()(
  observer((props: IAppLoadingPageProps) => {
    const renderText = (state: AppState) => {
      switch (state) {
        case 'isLoading':
          return getText('login_isLoading')
        case 'isLoggingIn':
          return getText('login_isLoggingIn')
        case 'hasBackendConnectionError':
          return getText('login_hasBackendConnectionError')
      }
    }

    return (
      <div className={s.appLoadingPage}>
        <div className={s.messageContainer}>{renderText(props.state)}</div>
      </div>
    )
  })
)

export default AppLoadingPage
