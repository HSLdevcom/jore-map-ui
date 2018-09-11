import React from 'react';
import { FiEdit, FiCopy, FiPlusSquare, FiPrinter, FiShare2 } from 'react-icons/fi';
import { observer } from 'mobx-react';
import ToolbarButton from './ToolbarButton';
import toolbarStore from '../../../stores/toolbarStore';
import ToolbarTools from '../../../enums/toolbarTools';
import * as s from './toolbar.scss';

@observer
export default class ToolbarToolButtons extends React.Component {

    private toggleTool = (tool: ToolbarTools) => {
        toolbarStore.toggleTool(tool);
    }

    private print = () => {
    }

    render() {
        return (
            <div className={s.toolbarButtonContainer}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <ToolbarButton
                        onClick={this.toggleTool.bind(this, ToolbarTools.Edit)}
                        isActive={toolbarStore.isActive(ToolbarTools.Edit)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTools.Edit)}
                        label='Muokkaa solmuja'
                    >
                        <FiEdit />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={this.toggleTool.bind(this, ToolbarTools.Copy)}
                        isActive={toolbarStore.isActive(ToolbarTools.Copy)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTools.Copy)}
                        label='Kopioi reitti toiseen suuntaan'
                    >
                        <FiCopy />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={this.toggleTool.bind(this, ToolbarTools.DivideLink)}
                        isActive={toolbarStore.isActive(ToolbarTools.DivideLink)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTools.DivideLink)}
                        label='Jaa linkki'
                    >
                        <FiShare2/>
                    </ToolbarButton>
                </div>
                {/* Second toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <ToolbarButton
                        onClick={this.toggleTool.bind(this, ToolbarTools.AddNode)}
                        isActive={toolbarStore.isActive(ToolbarTools.AddNode)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTools.AddNode)}
                        label='Lisää solmu'
                    >
                        <FiPlusSquare />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={this.print}
                        isActive={false}
                        isDisabled={toolbarStore.isDisabled(ToolbarTools.Print)}
                        label='Tulosta kartta'
                    >
                        <FiPrinter />
                    </ToolbarButton>
                </div>
            </div>
        );
    }
}
