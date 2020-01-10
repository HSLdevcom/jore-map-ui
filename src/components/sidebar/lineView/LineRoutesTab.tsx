import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import TransitIcon from '~/components/shared/TransitIcon';
import ButtonType from '~/enums/buttonType';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { LineStore } from '~/stores/lineStore';
import { SearchStore } from '~/stores/searchStore';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import s from './lineRoutesTab.scss';

interface ILineRoutesTabProps {
    lineStore?: LineStore;
    searchStore?: SearchStore;
}

@inject('lineStore', 'searchStore')
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

    private renderRouteList = (routes: IRoute[]) => {
        const line = this.props.lineStore!.line;

        return routes.map((route: IRoute, index: number) => {
            return (
                <div
                    key={index}
                    className={s.routeListItem}
                    onClick={this.redirectToRouteView(route.id)}
                >
                    <TransitIcon transitType={line!.transitType!} isWithoutBox={false} />
                    <div
                        className={classnames(
                            s.routeId,
                            TransitTypeHelper.getColorClass(line!.transitType!)
                        )}
                    >
                        {route.id}
                    </div>{' '}
                    {route.routeName}
                </div>
            );
        });
    };

    private redirectToRouteView = (routeId: string) => () => {
        const openRouteLink = routeBuilder
            .to(SubSites.routes, navigator.getQueryParamValues())
            .append(QueryParams.routes, routeId)
            .toLink();
        this.props.searchStore!.setSearchInput('');
        navigator.goTo(openRouteLink);
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
                        this.renderRouteList(line.routes)
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
