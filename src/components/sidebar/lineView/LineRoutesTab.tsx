import React from 'react';
import { inject, observer } from 'mobx-react';
import { LineStore } from '~/stores/lineStore';
import s from './lineRoutesTab.scss';

interface ILineRoutesTabProps {
    lineStore?: LineStore;
}

@inject('lineStore')
@observer
class LineRoutesTab extends React.Component<ILineRoutesTabProps> {
    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        return (
            <div className={s.lineRoutesTabView}>
                <div className={s.content}>
                    { line.routes.length === 0 ? (
                        <div>Linjalla ei olemassa olevia reittejä.</div>
                    ) : (
                        // TODO: render routes list here
                        <div>Reittilista tulee tähän (työn alla).</div>
                    )}
                </div>
            </div>
        );
    }
}

export default LineRoutesTab;
