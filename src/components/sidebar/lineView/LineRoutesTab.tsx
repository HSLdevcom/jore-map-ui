import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { LineStore } from '~/stores/lineStore';
import s from './lineRoutesTab.scss';

interface ILineRoutesTabProps {
    lineStore?: LineStore;
}

@inject('lineStore')
@observer
class LineRoutesTab extends React.Component<ILineRoutesTabProps> {
    private redirectToNewRouteView = () => {
        const line = this.props.lineStore!.line;

        const newRouteLink = routeBuilder
            .to(SubSites.newRoute)
            .set(QueryParams.lineId, line!.id)
            .toLink();

        navigator.goTo(newRouteLink);
    };

    render() {
        const line = this.props.lineStore!.line;
        if (!line) return null;

        return (
            <div className={s.lineRoutesTabView}>
                <div className={s.content}>
                    {line.routes.length === 0 ? (
                        <div>Linjalla ei olemassa olevia reittejä.</div>
                    ) : (
                        // TODO: render routes list here
                        <div>Reittilista tulee tähän (työn alla).</div>
                    )}

                    <Button
                        onClick={this.redirectToNewRouteView}
                        className={s.createRouteButton}
                        type={ButtonType.SQUARE}
                    >
                        {`Luo uusi reitti linjalle ${line.id}`}
                    </Button>
                </div>
            </div>
        );
    }
}

export default LineRoutesTab;
