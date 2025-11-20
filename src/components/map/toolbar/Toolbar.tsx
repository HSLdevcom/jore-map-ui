import { observer } from 'mobx-react';
import React from 'react';
import { matchPath } from 'react-router';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import LoginStore from '~/stores/loginStore';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import ToolbarHelp from './ToolbarHelp';
import * as s from './toolbar.scss';
import LinkButtons from './toolbarLinkButtons';
import RoutePathButtons from './toolbarRoutePathButtons';
import UndoButtons from './undoButtons';

@observer
class Toolbar extends React.Component {
    private renderViewSpecificTools = () => {
        if (!LoginStore!.hasWriteAccess) return null;
        if (matchPath(navigator.getPathName(), SubSites.routePath)) {
            return this.renderToolbarBlock([<RoutePathButtons />, <UndoButtons />]);
        }
        if (matchPath(navigator.getPathName(), SubSites.link)) {
            return this.renderToolbarBlock([<LinkButtons />, <UndoButtons />]);
        }
        if (matchPath(navigator.getPathName(), SubSites.node)) {
            return this.renderToolbarBlock([<UndoButtons />]);
        }
        return null;
    };

    private renderToolbarBlock = (elements: JSX.Element[]) => {
        return (
            <div className={s.toolbarBlock}>
                {elements.map((element: JSX.Element, index: number) => {
                    return (
                        <div className={s.element} key={`element-${index}`}>
                            {element}
                        </div>
                    );
                })}
            </div>
        );
    };

    render() {
        return (
            <div className={s.toolbarContainer}>
                <div className={s.toolbarRow}>
                    {this.renderViewSpecificTools()}
                    {this.renderToolbarBlock([
                        <ToolbarCommonButtons hasWriteAccess={LoginStore!.hasWriteAccess} />,
                    ])}
                </div>
                <ToolbarHelp />
            </div>
        );
    }
}

export default Toolbar;
