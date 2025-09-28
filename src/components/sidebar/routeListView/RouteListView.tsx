import classnames from 'classnames'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { IoIosCalendar } from 'react-icons/io'
import { match } from 'react-router'
import { Checkbox } from '~/components/controls'
import TransitTypeLink from '~/components/shared/TransitTypeLink'
import TransitType from '~/enums/transitType'
import { IRoute } from '~/models'
import ISchedule from '~/models/ISchedule'
import navigator from '~/routing/navigator'
import QueryParams from '~/routing/queryParams'
import routeBuilder from '~/routing/routeBuilder'
import SubSites from '~/routing/subSites'
import ScheduleService from '~/services/scheduleService'
import { AlertStore } from '~/stores/alertStore'
import { ConfirmStore } from '~/stores/confirmStore'
import { ErrorStore } from '~/stores/errorStore'
import { LoginStore } from '~/stores/loginStore'
import { MapStore } from '~/stores/mapStore'
import { NetworkStore } from '~/stores/networkStore'
import { IRouteItem, RouteListStore } from '~/stores/routeListStore'
import { RoutePathCopyStore } from '~/stores/routePathCopyStore'
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore'
import { RoutePathStore } from '~/stores/routePathStore'
import { RouteStore } from '~/stores/routeStore'
import { SearchStore } from '~/stores/searchStore'
import NavigationUtils from '~/utils/NavigationUtils'
import TransitToggleButtonBar from '../../controls/TransitToggleButtonBar'
import Loader from '../../shared/loader/Loader'
import SearchInput from '../../shared/searchInput/SearchInput'
import SearchResults from '../../shared/searchInput/SearchResults'
import SidebarHeader from '../SidebarHeader'
import EntityTypeToggles from '../homeView/EntityTypeToggles'
import CopyRoutePathView from './CopyRoutePathView'
import RouteItem from './RouteItem'
import * as s from './routeListView.scss'

interface IRouteListViewProps {
  match?: match<any>
  routeStore?: RouteStore
  errorStore?: ErrorStore
  confirmStore?: ConfirmStore
  searchStore?: SearchStore
  routeListStore?: RouteListStore
  networkStore?: NetworkStore
  routePathStore?: RoutePathStore
  mapStore?: MapStore
  routePathCopyStore?: RoutePathCopyStore
  alertStore?: AlertStore
  loginStore?: LoginStore
  routePathMassEditStore?: RoutePathMassEditStore
}

@inject(
  'routeStore',
  'searchStore',
  'routeListStore',
  'networkStore',
  'routePathStore',
  'errorStore',
  'confirmStore',
  'routePathCopyStore',
  'mapStore',
  'alertStore',
  'loginStore',
  'routePathMassEditStore'
)
@observer
class RouteListView extends React.Component<IRouteListViewProps> {
  async componentDidUpdate() {
    if (!navigator.getQueryParam(QueryParams.routes)) {
      const homeViewLink = routeBuilder.to(SubSites.home).toLink()
      navigator.goTo({ link: homeViewLink })
    }
    await this.props.routeListStore!.fetchRoutes({ forceUpdate: false })
  }

  async componentDidMount() {
    await this.props.routeListStore!.fetchRoutes({ forceUpdate: true })

    this.props.routePathStore!.clear()
    this.props.searchStore!.setSearchInput('')
  }

  componentWillUnmount() {
    this.props.routeStore!.clear()
    this.props.routeListStore!.clear()
  }

  private closeRoutePrompt = (route: IRoute) => {
    const routeListStore = this.props.routeListStore!
    const routeStore = this.props.routeStore!
    const routePathMassEditStore = this.props.routePathMassEditStore!
    const selectedTabIndex = routeListStore.getRouteItem(route.id)?.selectedTabIndex
    const isEditingRoutePaths = selectedTabIndex === 0
    const isDirty = isEditingRoutePaths ? routePathMassEditStore.isDirty : routeStore.isDirty
    if (routeListStore.routeIdToEdit === route.id && isDirty) {
      this.props.confirmStore!.openConfirm({
        confirmData: `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat sulkea reitin? Tallentamattomat muutokset kumotaan.`,
        onConfirm: () => {
          this.closeRoute(route, isEditingRoutePaths)
        },
        confirmButtonText: 'Kyllä',
      })
    } else {
      this.closeRoute(route, isEditingRoutePaths)
    }
  }

  private closeRoute = (route: IRoute, isEditingRoutePaths: boolean) => {
    const routeListStore = this.props.routeListStore!
    const routeStore = this.props.routeStore!
    const routePathMassEditStore = this.props.routePathMassEditStore!

    if (routeListStore.routeIdToEdit === route.id) {
      if (isEditingRoutePaths) {
        routePathMassEditStore.clear()
      } else {
        routeStore.clear()
      }
      routeListStore.setRouteIdToEdit(null)
    }

    this.props.routeListStore!.removeFromRouteItems(route.id)
    const closeRouteLink = routeBuilder
      .to(SubSites.current, navigator.getQueryParamValues())
      .remove(QueryParams.routes, route.id)
      .toLink()
    navigator.goTo({
      link: closeRouteLink,
      shouldSkipUnsavedChangesPrompt: true,
      shouldSkipNavigationAction: true,
    })
  }

  private toggleEditPrompt = (route: IRoute) => {
    const confirmStore = this.props.confirmStore!
    const routeListStore = this.props.routeListStore!
    const routeStore = this.props.routeStore!
    const routePathMassEditStore = this.props.routePathMassEditStore!

    const newRouteId = route.id === routeListStore.routeIdToEdit ? null : route.id
    const selectedTabIndex = routeListStore.getRouteItem(route.id)?.selectedTabIndex
    const isEditingRoutePaths = selectedTabIndex === 0

    const isDirty = isEditingRoutePaths ? routePathMassEditStore.isDirty : routeStore.isDirty
    if (!isDirty) {
      this.toggleEdit({ route, newRouteId, isEditingRoutePaths })
      return
    }

    let promptMessage
    if (isEditingRoutePaths || route.id === routeListStore.routeIdToEdit) {
      promptMessage = `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.`
    } else {
      promptMessage = `Sinulla on reitin ${routeStore.route.routeName} muokkaus kesken. Oletko varma, että haluat muokata toista reittiä? Tallentamattomat muutokset kumotaan.`
    }

    confirmStore.openConfirm({
      confirmData: promptMessage,
      onConfirm: () => {
        this.toggleEdit({ route, newRouteId, isEditingRoutePaths })
      },
      confirmButtonText: 'Kyllä',
    })
  }

  private toggleEdit = ({
    route,
    newRouteId,
    isEditingRoutePaths,
  }: {
    route: IRoute
    newRouteId: string | null
    isEditingRoutePaths: boolean
  }) => {
    const routeStore = this.props.routeStore!
    const routeListStore = this.props.routeListStore!
    const routePathMassEditStore = this.props.routePathMassEditStore!
    const isEditing = Boolean(newRouteId)
    // Start editing
    if (isEditing) {
      if (isEditingRoutePaths) {
        routePathMassEditStore.init({ routePaths: route.routePaths, routeId: route.id })
      } else {
        routeStore.init({ route, isNewRoute: false })
      }
      // Stop editing
    } else {
      if (isEditingRoutePaths) {
        routePathMassEditStore.clear()
      } else {
        routeStore.clear()
      }
    }
    routeListStore.setRouteIdToEdit(newRouteId)
  }

  private toggleTransitType = (type: TransitType) => {
    this.props.searchStore!.toggleTransitType(type)
  }

  private openSchedules = async (routeItem: IRouteItem) => {
    if (routeItem.areSchedulesVisible) {
      this.props.routeListStore!.setActiveSchedules(routeItem.route.id, null)
    } else {
      const activeSchedules: ISchedule[] = await ScheduleService.fetchActiveSchedules(
        routeItem.route.id
      )
      this.props.routeListStore!.setActiveSchedules(routeItem.route.id, activeSchedules)
    }
  }

  private toggleAreInactiveLinesHidden = () => {
    this.props.searchStore!.toggleAreInactiveLinesHidden()
  }

  private _render = () => {
    const routeListStore = this.props.routeListStore!
    const routeItems = routeListStore.routeItems
    const routeIdToEdit = routeListStore.routeIdToEdit
    if (routeItems.length < 1) {
      return <Loader />
    }
    if (this.props.routePathCopyStore!.isVisible) {
      return <CopyRoutePathView />
    }
    return (
      <>
        <SearchInput />
        {/* Render search container on top of routeList when needed to prevent routeList from re-rendering each time search container is shown. */}
        <div
          className={classnames(
            s.contentWrapper,
            this.props.searchStore!.searchInput !== '' ? s.hiddenScrolling : undefined
          )}
        >
          {this.props.searchStore!.searchInput !== '' && (
            <div className={s.searchContainerWrapper}>
              <EntityTypeToggles />
              {this.props.searchStore!.isSearchingForLines && (
                <>
                  <div className={s.toggleActiveLinesContainer}>
                    <Checkbox
                      content="Näytä vain aktiiviset linjat"
                      checked={this.props.searchStore!.areInactiveLinesHidden}
                      onClick={this.toggleAreInactiveLinesHidden}
                    />
                  </div>
                  <TransitToggleButtonBar
                    toggleSelectedTransitType={this.toggleTransitType}
                    selectedTransitTypes={this.props.searchStore!.selectedTransitTypes}
                  />
                </>
              )}
              <SearchResults />
            </div>
          )}
          <div className={s.routeList}>
            {routeItems.map((routeItem: IRouteItem, index: number) => {
              const route = routeItem.route
              const isEditing = routeIdToEdit === route.id
              const transitType = routeListStore.getLine(route.lineId)?.transitType!
              return (
                <div key={index} className={s.routeListItem}>
                  <SidebarHeader
                    isEditing={isEditing}
                    isCloseButtonVisible={true}
                    isEditButtonVisible={true}
                    isEditPromptHidden={true}
                    onCloseButtonClick={() => this.closeRoutePrompt(route)}
                    onEditButtonClick={() => this.toggleEditPrompt(route)}
                  >
                    <TransitTypeLink
                      transitType={transitType}
                      shouldShowTransitTypeIcon={true}
                      text={route!.id}
                      onClick={() =>
                        NavigationUtils.openLineView({
                          lineId: route!.lineId,
                        })
                      }
                      hoverText={`Avaa linja ${route!.lineId}`}
                      data-cy="routeId"
                    />
                    <div
                      className={classnames(
                        s.schedulesLink,
                        routeItem.areSchedulesVisible ? s.activeSchedulesLink : undefined
                      )}
                      onClick={() => this.openSchedules(routeItem)}
                      title={`Näytä reitin ${route.id} aikataulutiedot`}
                    >
                      <IoIosCalendar />
                    </div>
                  </SidebarHeader>
                  <div className={s.routeItemWrapper}>
                    <RouteItem
                      route={route}
                      transitType={transitType}
                      routeIdToEdit={routeIdToEdit}
                      selectedTabIndex={routeItem.selectedTabIndex}
                      areAllRoutePathsVisible={routeItem.areAllRoutePathsVisible}
                      areSchedulesVisible={routeItem.areSchedulesVisible}
                      activeSchedules={routeItem.activeSchedules}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  render() {
    const isCopyRouteListViewVisible = this.props.routePathCopyStore!.isVisible
    return (
      <div
        className={classnames(
          s.routeListView,
          isCopyRouteListViewVisible ? s.routeListWide : undefined
        )}
        data-cy="routeListView"
      >
        {this._render()}
      </div>
    )
  }
}

export default RouteListView
