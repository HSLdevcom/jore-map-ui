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
import NavigationUtils from '~/utils/NavigationUtils';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import TransitIcon from '../TransitIcon';
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
            <div key={route.id} className={s.routeItem} data-cy='routeItem'>
                <div className={s.routeItemHeader}>
                    <div
                        className={classNames(
                            s.routeName,
                            TransitTypeUtils.getColorClass(this.props.line.transitType)
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

    public render() {
        return (
            <div className={s.lineItemView}>
                <div
                    className={s.lineItem}
                    onClick={() => NavigationUtils.openLineView({ lineId: this.props.line.id })}
                    data-cy='lineItem'
                >
                    <div className={s.icon}>
                        <TransitIcon
                            transitType={this.props.line.transitType}
                            isWithoutBox={false}
                        />
                    </div>
                    <div
                        className={classNames(
                            TransitTypeUtils.getColorClass(this.props.line.transitType),
                            s.lineLabel
                        )}
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
