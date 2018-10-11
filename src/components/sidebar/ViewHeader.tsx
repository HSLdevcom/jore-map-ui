import React from 'react';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import ButtonType from '~/enums/buttonType';
import Button from '../controls/Button';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    header: string;
}

class ViewHeader extends React.Component<IViewHeaderProps> {
    private closeSidebarView = () => {
        const routesLink = routeBuilder.to(subSites.routes).toLink();
        navigator.goTo(routesLink);
    }

    private doNothing = () => {
        // TODO
    }

    public render(): any {
        return (
            <div className={s.viewHeaderView}>
                <div className={s.topic}>{this.props.header}</div>
                <div className={s.flexFiller} />
                <Button
                    className={s.editButton}
                    onClick={this.doNothing}
                    type={ButtonType.PRIMARY}
                    text={'Muokkaa'}
                />
                <div
                    className={s.closeButton}
                    onClick={this.closeSidebarView}
                />
            </div>
        );

    }
}
export default ViewHeader;
