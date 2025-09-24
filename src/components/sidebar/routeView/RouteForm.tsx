import React from 'react'
import InputContainer from '~/components/controls/InputContainer'
import TextContainer from '~/components/controls/TextContainer'
import { IRoute } from '~/models'
import navigator from '~/routing/navigator'
import QueryParams from '~/routing/queryParams'
import * as s from './routeForm.scss'

interface IRouteFormProps {
  route: IRoute
  isNewRoute: boolean
  isEditing: boolean
  onChangeRouteProperty: (property: keyof IRoute) => (value: any) => void
  invalidPropertiesMap: object
}

class RouteForm extends React.Component<IRouteFormProps> {
  render() {
    const {
      route,
      isNewRoute,
      invalidPropertiesMap,
      isEditing,
      onChangeRouteProperty,
    } = this.props
    const onChange = onChangeRouteProperty
    const queryParamLineId = navigator.getQueryParam(QueryParams.lineId) as string
    const isEditingDisabled = !isEditing
    return (
      <div className={s.formSection}>
        <div className={s.flexRow}>
          <InputContainer
            disabled={true}
            label="LINJAN TUNNUS"
            value={isNewRoute ? queryParamLineId : route.lineId}
          />
          <InputContainer
            disabled={!(isNewRoute && isEditing)}
            label="REITIN TUNNUS"
            value={route.id}
            onChange={onChange('id')}
            validationResult={invalidPropertiesMap['id']}
            capitalizeInput={true}
          />
        </div>
        <div className={s.flexRow}>
          <InputContainer
            disabled={isEditingDisabled}
            label="NIMI"
            value={route.routeName}
            onChange={onChange('routeName')}
            validationResult={invalidPropertiesMap['routeName']}
          />
          <InputContainer
            disabled={isEditingDisabled}
            label="NIMI RUOTSIKSI"
            value={route.routeNameSw}
            onChange={onChange('routeNameSw')}
            validationResult={invalidPropertiesMap['routeNameSw']}
          />
        </div>
        {!isNewRoute && (
          <div className={s.flexRow}>
            <TextContainer label="MUOKANNUT" value={route.modifiedBy} />
            <TextContainer
              label="MUOKATTU PVM"
              isTimeIncluded={true}
              value={route.modifiedOn}
            />
          </div>
        )}
      </div>
    )
  }
}

export default RouteForm
