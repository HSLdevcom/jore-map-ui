import React from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import { Checkbox } from '../controls';
import * as s from './mapLayersControl.scss';

interface ICheckboxToggles {
    kartta: boolean;
    satelliitti: boolean;
    maasto: boolean;
}

interface INodeWindowProps {
}

interface IMapLayersControlState {
    checkboxToggles: ICheckboxToggles;
    isMapLayersVisible: boolean;
}

@observer
export default class MapLayersControl extends React.Component
<INodeWindowProps, IMapLayersControlState> {
    constructor (props: any) {
        super(props);
        this.state = {
            checkboxToggles: {
                kartta: true,
                satelliitti: false,
                maasto: false,
            },
            isMapLayersVisible: false,
        };
    }

    private toggleCheckbox = (type: string) => {
        const newToggleState = this.state.checkboxToggles;
        newToggleState[type] = !this.state.checkboxToggles[type];
        this.setState({
            checkboxToggles: newToggleState,
        });
    }

    private showMapLayersContainer = () => {
        this.setState({
            isMapLayersVisible: true,
        });
    }

    private hideMapLayersContainer = () => {
        this.setState({
            isMapLayersVisible: false,
        });
    }

    render() {
        return (
            <div
                className={s.mapLayerControlView}
                onMouseEnter={this.showMapLayersContainer}
            >
                { !this.state.isMapLayersVisible &&
                <div className={s.mapLayerControlIcon}>
                    <IoMdMap />
                </div>
                }
                { this.state.isMapLayersVisible &&
                <div className={s.mapLayersContainer}>
                    { /* A screen sized invisible container is needed to get event registered
                    when mouse is left from mapLayersContainer*/ }
                    <div
                        className={s.fakeDiv}
                        onMouseMove={this.hideMapLayersContainer}
                    />
                    <div className={s.mapLayersWrapper}>
                        <Checkbox
                            onClick={this.toggleCheckbox.bind(this, 'kartta')}
                            checked={this.state.checkboxToggles.kartta}
                            text={'Kartta'}
                        />
                        <Checkbox
                            onClick={this.toggleCheckbox.bind(this, 'satelliitti')}
                            checked={this.state.checkboxToggles.satelliitti}
                            text={'Satelliitti'}
                        />
                        <Checkbox
                            onClick={this.toggleCheckbox.bind(this, 'maasto')}
                            checked={this.state.checkboxToggles.maasto}
                            text={'Maasto'}
                        />
                    </div>
                </div>
                }
            </div>
        );
    }
}
