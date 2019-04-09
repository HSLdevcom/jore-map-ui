
import React from 'react';
import { inject, observer } from 'mobx-react';
import { LineStore } from '~/stores/lineStore';
import s from './lineRoutesTab.scss';

interface ILineRoutesTabProps {
    lineStore?: LineStore;
}

@inject('lineStore')
@observer
class LineRoutesTab extends React.Component<ILineRoutesTabProps>{

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        return (
            <div className={s.lineRoutesTabView}>
                <div className={s.list}>
                    <div>todo: list routes here</div>
                </div>
            </div>
        );
    }
}

export default LineRoutesTab;
