import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '../../stores/sidebarStore';
import * as s from './linkView.scss';

interface IViewViewProps {
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@observer
class LinkView extends React.Component
<IViewViewProps> {
    constructor(props: any) {
        super(props);
    }

    private closeLinkView = () => {
        this.props.sidebarStore!.closeLinkView();
    }

    public render(): any {
        return (
            <div className={s.linkView}>
                <div className={s.header}>
                    <div
                        className={s.closeButton}
                        onClick={this.closeLinkView}
                    />
                </div>
            </div>
        );
    }
}
export default LinkView;
