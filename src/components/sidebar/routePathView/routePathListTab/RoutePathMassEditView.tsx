import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { RoutePathStore } from '~/stores/routePathStore';
import SidebarHeader from '../../SidebarHeader';
import s from './routePathMassEditView.scss';

interface IRoutePathMassEditViewProps {
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
}

interface IRoutePathMassEditViewState {
    editMode: EditMode | null;
    destinationFi1: string;
    destinationFi2: string;
    destinationSw1: string;
    destinationSw2: string;
    destinationShieldFi: string;
    destinationShieldSw: string;
    invalidPropertiesMap: object;
}

type EditMode = 'via' | 'kilpiVia';

@inject('routePathStore', 'routePathLinkMassEditStore')
@observer
class RoutePathMassEditView extends React.Component<
    IRoutePathMassEditViewProps,
    IRoutePathMassEditViewState
> {
    state = {
        editMode: null,
        destinationFi1: '',
        destinationFi2: '',
        destinationSw1: '',
        destinationSw2: '',
        destinationShieldFi: '',
        destinationShieldSw: '',
        invalidPropertiesMap: {}
    };
    private onPropertyChange = (property: string) => (value: string) => {
        // TODO
    };

    private editRoutePathLinks = () => {
        // TODO
    };

    private setEditMode = (mode: EditMode | null) => {
        // TODO: undo properties
        this.setState({
            editMode: mode
        });
    };

    private closeEditing = () => {
        // TODO
    };

    render() {
        const { isEditingDisabled } = this.props;
        const {
            editMode,
            destinationFi1,
            destinationFi2,
            destinationSw1,
            destinationSw2,
            destinationShieldFi,
            destinationShieldSw,
            invalidPropertiesMap
        } = this.state;

        return (
            <div className={s.routePathMassEditView}>
                <div className={s.headerWrapper}>
                    <SidebarHeader
                        onCloseButtonClick={this.closeEditing}
                        onBackButtonClick={() => this.setEditMode(null)}
                        isBackButtonVisible={false}
                        isCloseButtonVisible={false}
                    >
                        Muokkaa valittuja pysäkkejä (3)
                    </SidebarHeader>
                </div>
                <div className={s.content}>
                    {editMode === null ? (
                        <>
                            <Button
                                className={s.editModeSelectionButton}
                                onClick={() => this.setEditMode('via')}
                            >
                                Muokkaa määränpää tietoja
                            </Button>
                            <Button
                                className={s.editModeSelectionButton}
                                onClick={() => this.setEditMode('kilpiVia')}
                            >
                                Muokkaa määränpää kilpi tietoja
                            </Button>
                        </>
                    ) : editMode === 'via' ? (
                        <>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='1. MÄÄRÄNPÄÄ SUOMEKSI'
                                    disabled={isEditingDisabled}
                                    value={destinationFi1}
                                    validationResult={invalidPropertiesMap['destinationFi1']}
                                    onChange={this.onPropertyChange('destinationFi1')}
                                />
                                <InputContainer
                                    label='2. MÄÄRÄNPÄÄ SUOMEKSI'
                                    disabled={isEditingDisabled}
                                    value={destinationFi2}
                                    validationResult={invalidPropertiesMap['destinationFi2']}
                                    onChange={this.onPropertyChange('destinationFi2')}
                                />
                            </div>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='1. MÄÄRÄNPÄÄ RUOTSIKSI'
                                    disabled={isEditingDisabled}
                                    value={destinationSw1}
                                    validationResult={invalidPropertiesMap['destinationSw1']}
                                    onChange={this.onPropertyChange('destinationSw1')}
                                />
                                <InputContainer
                                    label='2. MÄÄRÄNPÄÄ RUOTSIKSI'
                                    disabled={isEditingDisabled}
                                    value={destinationSw2}
                                    validationResult={invalidPropertiesMap['destinationSw2']}
                                    onChange={this.onPropertyChange('destinationSw2')}
                                />
                            </div>
                        </>
                    ) : (
                        <div className={s.flexRow}>
                            <InputContainer
                                label='1. MÄÄRÄNPÄÄ KILPI SUOMEKSI'
                                disabled={isEditingDisabled}
                                value={destinationShieldFi}
                                validationResult={invalidPropertiesMap['destinationShieldFi']}
                                onChange={this.onPropertyChange('destinationShieldFi')}
                            />
                            <InputContainer
                                label='2. MÄÄRÄNPÄÄ KILPI RUOTSIKSI'
                                disabled={isEditingDisabled}
                                value={destinationShieldSw}
                                validationResult={invalidPropertiesMap['destinationShieldSw']}
                                onChange={this.onPropertyChange('destinationShieldSw')}
                            />
                        </div>
                    )}

                    {editMode !== null && (
                        <Button className={s.editButton} onClick={this.editRoutePathLinks}>
                            Muokkaa
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default RoutePathMassEditView;
