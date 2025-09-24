import { createBrowserHistory } from 'history'
import { inject, observer } from 'mobx-react'
import { syncHistoryWithStore } from 'mobx-react-router'
import React from 'react'
import { matchPath, Router, Switch } from 'react-router'
import { Route } from 'react-router-dom'
import EndpointPath from '~/enums/endpointPath'
import LocalStorageHelper from '~/helpers/LocalStorageHelper'
import { ISearchLine } from '~/models/ILine'
import navigator from '~/routing/navigator'
import SubSites from '~/routing/subSites'
import AuthService, { IAuthorizationResponse } from '~/services/authService'
import CodeListService from '~/services/codeListService'
import LineService from '~/services/lineService'
import NodeService from '~/services/nodeService'
import { CodeListStore } from '~/stores/codeListStore'
import { ErrorStore } from '~/stores/errorStore'
import { LoginStore } from '~/stores/loginStore'
import { MapStore } from '~/stores/mapStore'
import { SearchResultStore } from '~/stores/searchResultStore'
import { SearchStore } from '~/stores/searchStore'
import HttpUtils from '~/utils/HttpUtils'
import '~/utils/KeyEventHandler'
import AppFrame from './AppFrame'
import AppLoadingPage from './AppLoadingPage'
import * as s from './app.scss'
import Login from './login/Login'

interface IAppState {
  isLoginInProgress: boolean
  isAppInitializationInProgress: boolean
  hasBackendConnectionError: boolean
}

interface IAppProps {
  loginStore?: LoginStore
  mapStore?: MapStore
  searchStore?: SearchStore
  searchResultStore?: SearchResultStore
  codeListStore?: CodeListStore
  errorStore?: ErrorStore
}

const browserHistory = createBrowserHistory()
const history = syncHistoryWithStore(browserHistory, navigator.getStore())

@inject(
  'mapStore',
  'loginStore',
  'codeListStore',
  'searchStore',
  'searchResultStore',
  'errorStore'
)
@observer
class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props)
    this.state = {
      isLoginInProgress: true,
      isAppInitializationInProgress: false,
      hasBackendConnectionError: false,
    }
  }

  componentDidMount() {
    this.initLogin()
  }

  private initLogin = async () => {
    const isAfterLogin = Boolean(matchPath(navigator.getPathName(), SubSites.afterLogin))
    let hasBackendConnectionError = false
    if (!isAfterLogin) {
      let response
      try {
        response = (await HttpUtils.getRequest(
          EndpointPath.EXISTING_SESSION
        )) as IAuthorizationResponse
      } catch (e) {
        hasBackendConnectionError = true
      }
      if (response && response.isOk) {
        // Auth was ok, keep the current site as it is
        this.props.loginStore!.setAuthenticationInfo(response)
        await this.initApp()
      } else if (!hasBackendConnectionError) {
        // Redirect to login
        LocalStorageHelper.setItem('origin_url', navigator.getFullPath())
        navigator.goTo({ link: SubSites.login })
      }
    }

    this.setState({
      hasBackendConnectionError,
      isLoginInProgress: false,
    })
  }

  private initApp = async () => {
    this.setState({
      isAppInitializationInProgress: true,
    })
    Promise.all([this.initCodeLists(), this.fetchSaveLock()]).then(() => {
      this.setState({
        isAppInitializationInProgress: false,
      })

      // Lazy load lines and nodes in the background
      window.setTimeout(() => {
        this.fetchAllLines()
        this.fetchAllNodes()
      }, 1000)
    })
  }

  private fetchAllLines = async () => {
    this.props.searchStore!.setIsLoading(true)
    try {
      const searchLines: ISearchLine[] = await LineService.fetchAllSearchLines()
      this.props.searchResultStore!.setAllLines(searchLines)
      this.props.searchResultStore!.search()
    } catch (e) {
      this.props.errorStore!.addError('Linjojen haku ei onnistunut', e)
    }
    this.props.searchStore!.setIsLoading(false)
  }

  private initCodeLists = async () => {
    try {
      const codeLists = await CodeListService.fetchAllCodeLists()
      this.props.codeListStore!.setCodeListItems(codeLists)
    } catch (e) {
      this.props.errorStore!.addError('Koodiston haku epäonnistui', e)
    }
  }

  private fetchSaveLock = async () => {
    const isSaveLockEnabled = await AuthService.fetchIsSaveLockEnabled()
    this.props.loginStore!.setIsSaveLockEnabled(isSaveLockEnabled)
  }

  private fetchAllNodes = async () => {
    if (this.props.searchResultStore!.allNodes.length > 0) return

    try {
      await NodeService.fetchAllSearchNodes({ shouldUseCache: true }).then((nodes: any) => {
        this.props.searchResultStore!.setAllSearchNodes(nodes)
      })
    } catch (e) {
      this.props.errorStore!.addError('Solmujen haku ei onnistunut', e)
    }
  }

  private renderAfterLogin = () => {
    AuthService.authenticate(
      () => {
        this.initApp()

        // On success: Redirecting user to where she left off.
        const originUrl = LocalStorageHelper.getItem('origin_url')
        const destination = originUrl ? originUrl : SubSites.home
        LocalStorageHelper.removeItem('origin_url')
        navigator.goTo({ link: destination })
      },
      () => {
        // On error
        navigator.goTo({ link: SubSites.login })
        AuthService.logout()
        return null
      }
    )
    return <AppLoadingPage state={'isLoggingIn'} />
  }

  render() {
    if (this.state.isLoginInProgress) {
      return <AppLoadingPage state={'isLoggingIn'} />
    }
    if (this.state.isAppInitializationInProgress) {
      return <AppLoadingPage state={'isLoading'} />
    }
    if (this.state.hasBackendConnectionError) {
      return <AppLoadingPage state={'hasBackendConnectionError'} />
    }
    return (
      <div className={s.appView}>
        <Router history={history}>
          <Switch>
            <Route exact={true} path={SubSites.afterLogin} render={this.renderAfterLogin} />
            <Route path="/login" component={Login} />
            <Route path={'*'} component={AppFrame} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
