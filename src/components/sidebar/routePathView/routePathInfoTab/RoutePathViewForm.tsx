import React from 'react';
import { observer, inject } from 'mobx-react';
import Moment from 'moment';
import { FiRefreshCw } from 'react-icons/fi';
import { IRoutePath } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import routePathValidationModel from '~/validation/models/routePathValidationModel';
import { IValidationResult } from '~/validation/FormValidator';
import InputContainer from '../../InputContainer';
import LinkListView from './LinkListView';
import { Button, Dropdown, Checkbox } from '../../../controls';
import ButtonType from '../../../../enums/buttonType';
import * as s from '../routePathView.scss';

interface IRoutePathViewFormProps {
    routePathStore?: RoutePathStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    onChange: Function;
}

@inject('routePathStore')
@observer
class RoutePathViewForm extends React.Component<IRoutePathViewFormProps>{
    private onClick = () => {
        // TODO
    }

    private onChange = (property: string) =>
    (value: string, validationResult: IValidationResult) => {
        this.props.onChange(property, value, validationResult);
    }

    private updateLength = ():void => (
        this.props.routePathStore!.updateRoutePathProperty(
            'length',
            this.props.routePathStore!.getCalculatedLength(),
        )
    )

    private redirectToNewRoutePathView = () => {
        const routePath = this.props.routePathStore!.routePath;
        if (!routePath) return;

        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath, { routeId: routePath.routeId, lineId: routePath.lineId })
            .toLink();

        navigator.goTo(newRoutePathLink);
    }

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;

        const datetimeStringDisplayFormat = 'YYYY-MM-DD HH:mm:ss';
        const routePath = this.props.routePath;
        return (
        <div className={s.form}>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <InputContainer
                        label='REITIN NIMI SUOMEKSI'
                        disabled={true}
                        value={routePath.routePathName}
                        onChange={this.onChange('routePathName')}
                    />
                    <InputContainer
                        label='REITIN NIMI RUOTSIKSI'
                        disabled={true}
                        value={routePath.routePathNameSw}
                        onChange={this.onChange('routePathNameSw')}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LÄHTÖPAIKKA SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={routePath.originFi}
                        onChange={this.onChange('originFi')}
                        validatorRule={routePathValidationModel.origin}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={routePath.destinationFi}
                        onChange={this.onChange('destinationFi')}
                        validatorRule={routePathValidationModel.destination}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LÄHTÖPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.originSw}
                        onChange={this.onChange('originSw')}
                        validatorRule={routePathValidationModel.origin}
                    />
                    <InputContainer
                        label='PÄÄTEPAIKKA RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.destinationSw}
                        onChange={this.onChange('destinationSw')}
                        validatorRule={routePathValidationModel.destination}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='LYHENNE SUOMEKSI'
                        disabled={isEditingDisabled}
                        value={routePath.routePathShortName}
                        onChange={this.onChange('routePathShortName')}
                        validatorRule={routePathValidationModel.shortName}
                    />
                    <InputContainer
                        label='LYHENNE RUOTSIKSI'
                        disabled={isEditingDisabled}
                        value={routePath.routePathShortNameSw}
                        onChange={this.onChange('routePathShortNameSw')}
                        validatorRule={routePathValidationModel.shortName}
                    />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='VOIM. AST'
                        value={Moment(routePath.startTime)
                            .format(datetimeStringDisplayFormat)}
                        disabled={isEditingDisabled}
                    />
                    <InputContainer
                        label='VIIM.VOIM.OLO'
                        value={Moment(routePath.endTime)
                            .format(datetimeStringDisplayFormat)}
                        disabled={isEditingDisabled}
                    />
                    <InputContainer
                        label='PITUUS'
                        value={routePath.length.toString()}
                        disabled={isEditingDisabled}
                        validatorRule={routePathValidationModel.length}
                        icon={<FiRefreshCw/>}
                        onIconClick={this.updateLength}
                    />
                    <InputContainer
                        label={'Laskettu'}
                        value={this.props.routePathStore!.getCalculatedLength()}
                        disabled={true}
                    />
                </div>
                <div className={s.flexRow}>
                    <Dropdown
                        label='SUUNTA'
                        onChange={this.onChange}
                        items={['1', '2', '3']}
                        selected={this.props.routePath.direction}
                    />
                    <div className={s.formItem}>
                        <div className={s.inputLabel}>
                            POIKKEUSREITTI
                        </div>
                        <div className={s.flexInnerRow}>
                            <Checkbox
                                checked={!routePath.alternativePath}
                                text={'Ei'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexFiller} />
                            <Checkbox
                                checked={routePath.alternativePath}
                                text={'Kyllä'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexFiller} />
                        </div>
                    </div>
                </div>
                <div className={s.flexRow}>
                    <div className={s.flexGrow}>
                        <Dropdown // TODO: what is this field?
                            onChange={this.onClick}
                            items={['Kaikki solmut']}
                            selected={'Kaikki solmut'}
                            label='SOLMUTYYPIT'
                        />
                    </div>
                    <div className={s.flexFiller} />
                </div>
                <div className={s.flexRow}>
                    <InputContainer
                        label='PÄIVITYSPVM'
                        value={Moment(routePath.lastModified)
                            .format(datetimeStringDisplayFormat)}
                        disabled={true}
                    />
                    <InputContainer
                        label='PÄIVITTÄJÄ'
                        value={routePath.modifiedBy}
                        disabled={true}
                    />
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                    >
                        Varustelutiedot
                    </Button>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                    >
                        Solmu
                    </Button>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                    >
                        Solmut Exceliin
                    </Button>
                </div>
                <div className={s.flexRow}>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                    >
                        Linkki
                    </Button>
                    <Button
                        onClick={this.onClick}
                        type={ButtonType.ROUND}
                    >
                        Aikataulu
                    </Button>
                    <Button
                        type={ButtonType.ROUND}
                        onClick={this.redirectToNewRoutePathView!}
                    >
                        Kopioi
                    </Button>
                </div>
            </div>
            <div className={s.formSection}>
                <div className={s.formItem}>
                    <div className={s.topic}>
                        KARTTA
                    </div>
                    <div className={s.formItem}>
                        <div className={s.flexInnerRow}>
                            <Button
                                onClick={this.onClick}
                                type={ButtonType.ROUND}
                            >
                                Kartta
                            </Button>
                            <Checkbox
                                checked={false}
                                text={'Muotopisteet kartalle'}
                                onClick={this.onClick}
                            />
                            <div className={s.flexButtonFiller} />
                        </div>
                    </div>
                </div>
                <div className={s.formItem}>
                    Esitettävien ajoaikojen kausi ja aikajakso
                    <div className={s.flexInnerRow}>
                        <Dropdown
                            onChange={this.onChange}
                            items={['Suunta 2']}
                            selected={'Suunta 1'}
                        />
                        <Dropdown
                            onChange={this.onClick}
                            items={['Suunta 2']}
                            selected={'Suunta 1'}
                        />
                    </div>
                </div>
            </div>
            <LinkListView
                routePath={this.props.routePath}
            />
        </div>
        );
    }
}
export default RoutePathViewForm;
