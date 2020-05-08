import { autorun, reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CalculatedInputField from '~/components/controls/CalculatedInputField';
import { ILink, IRoutePath } from '~/models';
import LinkService from '~/services/linkService';
import { CodeListStore } from '~/stores/codeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { Dropdown } from '../../../controls';
import InputContainer from '../../../controls/InputContainer';
import TextContainer from '../../../controls/TextContainer';
import * as s from './routePathInfoTab.scss';

interface IRoutePathInfoTabProps {
    routePathStore?: RoutePathStore;
    codeListStore?: CodeListStore;
    isEditingDisabled: boolean;
    routePath: IRoutePath;
    invalidPropertiesMap: object;
}

interface IRoutePathInfoTabState {
    calculatedValue: number | null;
}

@inject('routePathStore', 'codeListStore')
@observer
class RoutePathInfoTab extends React.Component<IRoutePathInfoTabProps, IRoutePathInfoTabState> {
    private isRoutePathLinksChangedListener: IReactionDisposer;
    private mounted: boolean;

    constructor(props: IRoutePathInfoTabProps) {
        super(props);
        this.state = {
            calculatedValue: null,
        };
    }

    async componentWillMount() {
        this.updateCalculatedLength();
    }

    async componentDidMount() {
        this.mounted = true;
        this.isRoutePathLinksChangedListener = reaction(
            () =>
                this.props.routePathStore!.routePath &&
                this.props.routePathStore!.routePath!.routePathLinks.length,
            this.updateCalculatedLength
        );
        autorun(() => this.updateCalculatedLength);
    }

    componentWillUnmount() {
        this.isRoutePathLinksChangedListener();
        this.mounted = false;
    }

    private updateCalculatedLength = async () => {
        if (!this.props.routePathStore!.routePath) {
            return;
        }
        const calculatedValue = await this.getCalculatedLength();
        if (this.mounted) {
            this.setState({
                calculatedValue,
            });
        }
    };

    private updateLength = async () => {
        const routePathStore = this.props.routePathStore;
        const length = await this.getCalculatedLength();
        routePathStore!.updateRoutePathProperty('length', length);
    };

    private getCalculatedLength = async () => {
        const routePathStore = this.props.routePathStore;
        const routePath = routePathStore!.routePath;
        const promises: Promise<ILink | null>[] = [];
        routePath!.routePathLinks.forEach((routePathLink) => {
            promises.push(
                LinkService.fetchLink(
                    routePathLink.startNode.id,
                    routePathLink.endNode.id,
                    routePath!.transitType!
                )
            );
        });
        const links = await Promise.all(promises);
        // RoutePath length is calculated by summing up length & measuredLength values of each link.
        // If measured length is missing for a link, use length instead.
        let length = 0;
        links.forEach((link) => {
            length += link!.measuredLength ? link!.measuredLength : link!.length;
        });
        return length;
    };

    private onChangeRoutePathProperty = (property: keyof IRoutePath) => (value: any) => {
        this.props.routePathStore!.updateRoutePathProperty(property, value);
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        const isUpdating =
            !this.props.routePathStore!.isNewRoutePath || this.props.isEditingDisabled;
        const invalidPropertiesMap = this.props.invalidPropertiesMap;
        const onChange = this.onChangeRoutePathProperty;
        const routePath = this.props.routePath;
        return (
            <div className={s.routePathInfoTabView}>
                <div className={s.form}>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='NIMI SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.nameFi}
                                onChange={onChange('nameFi')}
                                validationResult={invalidPropertiesMap['nameFi']}
                                data-cy='nameFi'
                            />
                            <InputContainer
                                label='NIMI RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.nameSw}
                                onChange={onChange('nameSw')}
                                validationResult={invalidPropertiesMap['nameSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originFi}
                                onChange={onChange('originFi')}
                                validationResult={invalidPropertiesMap['originFi']}
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationFi}
                                onChange={onChange('destinationFi')}
                                validationResult={invalidPropertiesMap['destinationFi']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LÄHTÖPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.originSw}
                                onChange={onChange('originSw')}
                                validationResult={invalidPropertiesMap['originSw']}
                            />
                            <InputContainer
                                label='PÄÄTEPAIKKA RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.destinationSw}
                                onChange={onChange('destinationSw')}
                                validationResult={invalidPropertiesMap['destinationSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LYHENNE SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={routePath.shortNameFi}
                                onChange={onChange('shortNameFi')}
                                validationResult={invalidPropertiesMap['shortNameFi']}
                            />
                            <InputContainer
                                label='LYHENNE RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={routePath.shortNameSw}
                                onChange={onChange('shortNameSw')}
                                validationResult={invalidPropertiesMap['shortNameSw']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='POIKKEUSREITTI'
                                disabled={isEditingDisabled}
                                selected={this.props.routePath.exceptionPath}
                                items={this.props.codeListStore!.getDropdownItemList('Kyllä/Ei')}
                                onChange={onChange('exceptionPath')}
                                validationResult={invalidPropertiesMap['exceptionPath']}
                            />
                            <CalculatedInputField
                                label='PITUUS (m)'
                                isDisabled={isEditingDisabled}
                                onChange={onChange('length')}
                                useCalculatedValue={this.updateLength}
                                validationResult={invalidPropertiesMap['length']}
                                value={routePath.length}
                                calculatedValue={this.state.calculatedValue}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <Dropdown
                                label='SUUNTA'
                                disabled={isUpdating}
                                selected={this.props.routePath.direction}
                                items={this.props.codeListStore!.getDropdownItemList('Suunta')}
                                onChange={onChange('direction')}
                                validationResult={invalidPropertiesMap['direction']}
                            />
                            <InputContainer
                                label='VOIM. AST'
                                disabled={isUpdating}
                                type='date'
                                value={routePath.startDate}
                                onChange={onChange('startDate')}
                                validationResult={invalidPropertiesMap['startDate']}
                            />
                            <InputContainer
                                label='VIIM.VOIM.OLO'
                                disabled={isUpdating}
                                type='date'
                                value={routePath.endDate}
                                onChange={onChange('endDate')}
                                validationResult={invalidPropertiesMap['endDate']}
                            />
                        </div>
                        <div className={s.flexRow}>
                            <TextContainer label='MUOKANNUT' value={routePath.modifiedBy} />
                            <TextContainer
                                label='MUOKATTU PVM'
                                isTimeIncluded={true}
                                value={routePath.modifiedOn}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default RoutePathInfoTab;
