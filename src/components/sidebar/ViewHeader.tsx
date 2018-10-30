import React from 'react';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    header: string;
    children?: any;
    onBeforeClosing?: Function;
}

class ViewHeader extends React.Component<IViewHeaderProps> {
    private closeSidebarView = () => {
        if (!this.props.onBeforeClosing || this.props.onBeforeClosing()) {
            const routesLink = routeBuilder.to(subSites.routes).toLink();
            navigator.goTo(routesLink);
        }
    }

    public render(): any {
        return (
            <div className={s.viewHeaderView}>
                <div className={s.topic}>{this.props.header}</div>
                <div className={s.flexFiller} />
                 {this.props.children}
                <div
                    className={s.closeButton}
                    onClick={this.closeSidebarView}
                />
            </div>
        );

    }
}
export default ViewHeader;
