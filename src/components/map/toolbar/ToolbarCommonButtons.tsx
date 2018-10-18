import React from 'react';
import { FiPrinter, FiExternalLink } from 'react-icons/fi';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import RouteBuilder from '~/routing/routeBuilder';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
export default class ToolbarCommonButtons extends React.Component {
    private print = () => {
    }

    private newWindowUrl = () => {
        return RouteBuilder.getCurrentLocationWithParams();
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
