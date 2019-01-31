import React, { ReactNode } from 'react';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import * as s from './viewHeader.scss';

interface IViewHeaderProps {
    children: ReactNode;
    closePromptMessage?: string;
    hideCloseButton?: boolean;
}

const viewHeader = (props:IViewHeaderProps) => {
    const closeSidebarView = () => {
        if (!props.closePromptMessage || confirm(props.closePromptMessage)) {
            const routesLink = routeBuilder.to(subSites.routes).toLink();
            navigator.goTo(routesLink);
        }
    };
    return (
        <div className={s.viewHeaderView}>
            <div className={s.topic}>{props.children}</div>
            { !props.hideCloseButton &&
                <div
                    className={s.closeButton}
                    onClick={closeSidebarView}
                />
            }
        </div>
    );
};
export default viewHeader;
