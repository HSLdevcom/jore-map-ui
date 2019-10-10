import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import { matchPath } from 'react-router';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import LoginStore from '~/stores/loginStore';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import * as s from './toolbar.scss';
import ToolbarHelp from './toolbarHelp';
import LinkButtons from './toolbarLinkButtons';
import RoutePathButtons from './toolbarRoutePathButtons';

@observer
class Toolbar extends React.Component {
    private renderObjectSpecificTools = () => {
        if (!LoginStore!.hasWriteAccess) return null;
        if (matchPath(navigator.getPathName(), SubSites.routePath)) {
            return (
                <div className={classnames(s.toolbar, s.modeSpecificToolbar)}>
                    <RoutePathButtons />
                </div>
            );
        }
        if (matchPath(navigator.getPathName(), SubSites.link)) {
            return (
                <div className={classnames(s.toolbar, s.modeSpecificToolbar)}>
                    <LinkButtons />
                </div>
            );
        }
        return null;
    };

    render() {
        return (
            <div className={s.toolbarContainer}>
                <div className={s.toolbarRow}>
                    {this.renderObjectSpecificTools()}
                    <div className={s.toolbar}>
                        <ToolbarCommonButtons hasWriteAccess={LoginStore!.hasWriteAccess} />
                    </div>
                </div>
                <ToolbarHelp />
            </div>
        );
    }
}

export default Toolbar;
