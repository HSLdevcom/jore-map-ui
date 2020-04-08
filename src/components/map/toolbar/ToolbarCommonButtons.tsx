import { observer } from 'mobx-react';
import React from 'react';
import { FiExternalLink, FiPlus, FiPrinter } from 'react-icons/fi';
import { TiLink } from 'react-icons/ti';
import ToolbarToolType from '~/enums/toolbarToolType';
import Navigator from '~/routing/navigator';
import ToolbarStore from '~/stores/toolbarStore';
import MapControlButton from '../mapControls/MapControlButton';

interface IToolbarCommonButtonsProps {
    hasWriteAccess: boolean;
}

@observer
class ToolbarCommonButtons extends React.Component<IToolbarCommonButtonsProps> {
    private print = () => {};

    private openInNewTab = () => {
        const path = Navigator.getPathName() + Navigator.getSearch();
        window.open(path, '_blank');
    };

    private selectTool = (tool: ToolbarToolType) => () => {
        ToolbarStore.selectTool(tool);
    };

    render() {
        return (
            <>
                {this.props.hasWriteAccess && (
                    <>
                        <MapControlButton
                            onClick={this.selectTool(ToolbarToolType.AddNetworkNode)}
                            isActive={ToolbarStore.isSelected(ToolbarToolType.AddNetworkNode)}
                            isDisabled={false}
                            label='Lisää solmu'
                        >
                            <FiPlus />
                        </MapControlButton>
                        <MapControlButton
                            onClick={this.selectTool(ToolbarToolType.AddNetworkLink)}
                            isActive={ToolbarStore.isSelected(ToolbarToolType.AddNetworkLink)}
                            isDisabled={false}
                            label='Lisää linkki'
                        >
                            <TiLink />
                        </MapControlButton>
                    </>
                )}
                <MapControlButton
                    onClick={this.print}
                    isActive={false}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.Print)}
                    label='Tulosta kartta'
                >
                    <FiPrinter />
                </MapControlButton>
                <MapControlButton
                    onClick={this.openInNewTab}
                    isActive={false}
                    isDisabled={false}
                    label='Avaa uusi ikkuna'
                >
                    <FiExternalLink />
                </MapControlButton>
            </>
        );
    }
}
export default ToolbarCommonButtons;
