import { observer } from 'mobx-react';
import React from 'react';
import { matchPath } from 'react-router';
import SubSites from '~/routing/subSites';
import LoginStore from '~/stores/loginStore';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import ToolbarHelp from './ToolbarHelp';
import * as s from './toolbar.scss';
import LinkButtons from './toolbarLinkButtons';
import RoutePathButtons from './toolbarRoutePathButtons';
import UndoButtons from './undoButtons';

interface IToolbarProps {
    pathname: string;
}

@observer
class Toolbar extends React.Component<IToolbarProps> {
    private renderViewSpecificTools = () => {
        if (!LoginStore!.hasWriteAccess) return null;
        const pathname = this.props.pathname;
        console.log(pathname);
        if (matchPath(pathname, SubSites.routePath)) {
            return this.renderToolbarBlock([<RoutePathButtons />, <UndoButtons />]);
        }
        if (matchPath(pathname, SubSites.link)) {
            return this.renderToolbarBlock([<LinkButtons />, <UndoButtons />]);
        }
        if (matchPath(pathname, SubSites.node)) {
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
