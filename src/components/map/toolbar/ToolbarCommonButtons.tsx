import React from 'react';
import { FiPrinter, FiExternalLink } from 'react-icons/fi';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import Navigator from '~/routing/navigator';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
class ToolbarCommonButtons extends React.Component {
    private print = () => {
    }

    private newWindowUrl = () => {
        return Navigator.getPathName() + Navigator.getSearch();
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
                    <MapControlButton
                        onClick={this.newWindowUrl}
                        isActive={false}
                        isDisabled={false}
                        label='Avaa uusi ikkuna'
                    >
                        <a
                            href={this.newWindowUrl()}
                            target='_blank'
                        >
                            <FiExternalLink />
                        </a>
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
export default ToolbarCommonButtons;
