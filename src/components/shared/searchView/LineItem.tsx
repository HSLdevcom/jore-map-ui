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
import LineHelper from '~/util/LineHelper';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import * as s from './lineItem.scss';

interface ILineItemProps {
    line: ISearchLine;
}

class LineItem extends React.Component<ILineItemProps> {
    private openRoute = (routeId: string) => () => {
        const routeViewLink = routeBuilder
            .to(SubSites.routes, navigator.getQueryParamValues())
            .append(QueryParams.routes, routeId)
            .toLink();
        searchStore.setSearchInput('');
        navigator.goTo({ link: routeViewLink });
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
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({ link: lineViewLink });
    };

    public render() {
        return (
            <div className={s.lineItemView}>
                <div className={s.lineItem}>
                    <div className={s.icon}>
                        {LineHelper.getTransitIcon(this.props.line.transitType, false)}
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
