import React from 'react';
import routeBuilder  from '../../routing/routeBuilder';
import subSites from '../../routing/subSites';
import navigator from '../../routing/navigator';
import * as s from './sidebarViewHeader.scss';

interface ISidebarViewHeaderProps {
    header: string;
}

class SidebarViewHeader extends React.Component<ISidebarViewHeaderProps> {
    constructor(props: any) {
        super(props);
    }

    private closeSidebarView = () => {
        const routesLink = routeBuilder.to(subSites.routes).toLink();
        navigator.goTo(routesLink);
    }

    public render(): any {
        return (
            <div className={s.sidebarViewHeader}>
                <div className={s.topic}>{this.props.header}</div>
                <div
                    className={s.closeButton}
                    onClick={this.closeSidebarView}
                />
            </div>
        );

    }
}
export default SidebarViewHeader;
