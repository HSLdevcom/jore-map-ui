import * as React from 'react';
import * as s from './sidebarViewHeader.scss';

interface ISidebarViewHeaderProps {
    header: string;
    closeSidebarView: Function;
}

class SidebarViewHeader extends React.Component<ISidebarViewHeaderProps> {
    constructor(props: any) {
        super(props);
    }

    private closeSidebarView = () => {
        this.props.closeSidebarView();
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
