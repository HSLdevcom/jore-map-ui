import React from 'react';
import { observer } from 'mobx-react';
import { IoMdMap } from 'react-icons/io';
import { RadioButton } from '../controls';
import * as s from './mapLayersControl.scss';

interface INodeWindowProps {
}

interface IMapLayersControlState {
    selectedOption: string;
}

@observer
export default class MapLayersControl extends React.Component
<INodeWindowProps, IMapLayersControlState> {
    constructor (props: any) {
        super(props);
        this.state = {
            selectedOption: 'kartta',
        };
    }

    private toggleRadioButton = (option: string) => {
        this.setState({
            selectedOption: option,
        });
    }

    render() {
        return (
            <div className={s.mapLayerControlView}>
                <div className={s.mapLayerControlIcon}>
                    <IoMdMap />
                </div>
                <div className={s.mapLayersContainer}>
                    <RadioButton
                        onClick={this.toggleRadioButton.bind(this, 'kartta')}
                        checked={this.state.selectedOption === 'kartta'}
                        text={'Kartta'}
                    />
                    <RadioButton
                        onClick={this.toggleRadioButton.bind(this, 'satelliitti')}
                        checked={this.state.selectedOption === 'satelliitti'}
                        text={'Satelliitti'}
                    />
                    <RadioButton
                        onClick={this.toggleRadioButton.bind(this, 'maasto')}
                        checked={this.state.selectedOption === 'maasto'}
                        text={'Maasto'}
                    />
                </div>
            </div>
        );
    }
}
