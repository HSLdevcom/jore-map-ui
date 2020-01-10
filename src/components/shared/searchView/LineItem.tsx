import classNames from 'classnames';
import React from 'react';
import ReactMoment from 'react-moment';
import ISearchLine from '~/models/searchModels/ISearchLine';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import searchStore from '~/stores/searchStore';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import TransitIcon from '../TransitIcon';
import * as s from './lineItem.scss';

interface ILineItemProps {
    line: ISearchLine;
}

class LineItem extends React.Component<ILineItemProps> {
    private openRoute = (routeId: string) => () => {
        const openRouteLink = routeBuilder
            .to(SubSites.routes, navigator.getQueryParamValues())
            .append(QueryParams.routes, routeId)
            .toLink();
        searchStore.setSearchInput('');
        navigator.goTo(openRouteLink);
    };

    private renderRoute(route: ISearchLineRoute): any {
        return (
            <div key={route.id} className={s.routeItem}>
                <div className={s.routeItemHeader}>
                    <div
                        className={classNames(
                            s.routeName,
                            TransitTypeHelper.getColorClass(this.props.line.transitType)
                        )}
                        onClick={this.openRoute(route.id)}
                    >
                        <div>{route.id}</div>
                        <div>{route.name}</div>
                    </div>
                    <div className={s.routeDate}>
                        {'Muokattu: '}
                        <ReactMoment date={route.date} format='DD.MM.YYYY HH:mm' />
                    </div>
                </div>
            </div>
        );
    }

    private redirectToLineView = (lineId: string) => () => {
        const url = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo(url);
    };

    public render() {
        return (
            <div className={s.lineItemView}>
                <div className={s.lineItem}>
                    <div className={s.icon}>
                        <TransitIcon transitType={this.props.line.transitType} withoutBox={false} />
                    </div>
                    <div
                        className={classNames(
                            TransitTypeHelper.getColorClass(this.props.line.transitType),
                            s.lineLabel
                        )}
                        onClick={this.redirectToLineView(this.props.line.id)}
                    >
                        {this.props.line.id}
                    </div>
                </div>
                {this.props.line.routes
                    .slice()
                    .sort((a, b) => (a.id < b.id ? -1 : 1))
                    .map(route => this.renderRoute(route))}
            </div>
        );
    }
}

export default LineItem;
