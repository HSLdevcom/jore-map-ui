import React from 'react';
import { FiPrinter } from 'react-icons/fi';
import { observer } from 'mobx-react';
import MapControlButton from '../mapControls/MapControlButton';
import toolbarStore from '../../../stores/toolbarStore';
import ToolbarTool from '../../../enums/toolbarTool';
import * as s from './toolbarToolButtons.scss';

@observer
export default class ToolbarCommonButtons extends React.Component {
    private print = () => {
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.print}
                        isActive={false}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.Print)}
                        label='Tulosta kartta'
                    >
                        <FiPrinter />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
