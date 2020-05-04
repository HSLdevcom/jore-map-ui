import classnames from 'classnames';
import Moment from 'moment';
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import IRoutePath from '~/models/IRoutePath';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import TransitIcon from './TransitIcon';
import * as s from './routePathList.scss';

interface IRoutePathListProps {
    topic: string;
    routePaths: IRoutePath[];
    className?: string;
}

interface IRoutePathListState {
    searchInputValue: string;
    areAllRoutePathsVisible: boolean;
}

const ROUTE_PATH_SHOW_LIMIT = 10;

class RoutePathList extends React.Component<IRoutePathListProps, IRoutePathListState> {
    constructor(props: IRoutePathListProps) {
        super(props);

        this.state = {
            searchInputValue: '',
            areAllRoutePathsVisible: false,
        };
    }

    private renderRoutePathRow = (routePath: IRoutePath, key: string) => {
        return (
            <div key={key} className={s.routePathRow}>
                <div className={s.itemContainerOnRight}>
                    <div className={s.transitTypeIcon}>
                        <TransitIcon transitType={routePath.transitType!} isWithoutBox={false} />
                    </div>
                    <div className={s.direction}>{routePath.direction}</div>
                    {this.renderTextRow(routePath)}
                </div>
                <div
                    className={s.icon}
                    title={`Avaa reitin ${routePath.routeId} reitinsuunta uuteen ikkunaan`}
                    onClick={this.openRoutePathInNewTab(routePath)}
                >
                    <FiExternalLink />
                </div>
            </div>
        );
    };

    private renderTextRow = (routePath: IRoutePath) => {
        return (
            <div>
                <div>
                    {routePath.routeId} {routePath.originFi} - {routePath.destinationFi}
                </div>
                <div className={s.timestampRow}>
                    {Moment(routePath.startDate).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePath.endDate).format('DD.MM.YYYY')}
                </div>
            </div>
        );
    };

    private openRoutePathInNewTab = (routePath: IRoutePath) => () => {
        const routePathLink = routeBuilder
            .to(SubSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction,
                ].join(',')
            )
            .toLink();
        window.open(routePathLink, '_blank');
    };

    private onSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.setState({
            searchInputValue: newValue,
        });
    };

    private toggleAllRoutePathsVisibility = () => {
        this.setState({ areAllRoutePathsVisible: !this.state.areAllRoutePathsVisible });
    };

    render() {
        const { topic, routePaths, className } = this.props;

        const matchWildcard = (text: string, rule: string) => {
            return new RegExp(`^${rule.split('*').join('.*')}$`).test(text);
        };
        const matchText = (text: string, searchInput: string) => {
            if (searchInput.includes('*')) {
                return matchWildcard(text, searchInput);
            }
            return text.includes(searchInput);
        };

        const searchInputValue = this.state.searchInputValue.toLowerCase();
        const filteredRoutePaths = routePaths.filter((routePath) => {
            if (matchText(routePath.routeId.toLowerCase(), searchInputValue)) return true;
            if (
                matchText(
                    `${routePath.originFi.toLowerCase()} - ${routePath.destinationFi.toLowerCase()}`,
                    searchInputValue
                )
            ) {
                return true;
            }

            return false;
        });

        const hasNoSearchResults = filteredRoutePaths.length === 0;

        return (
            <div className={classnames(s.routePathList, className ? className : undefined)}>
                <div className={s.topic}>{topic}</div>
                {routePaths.length > 0 && (
                    <input
                        placeholder='Suodata reitinsuuntia (reitin tunnus, lähtö- / päätepaikka)'
                        type='text'
                        value={this.state.searchInputValue}
                        onChange={this.onSearchInputChange}
                    />
                )}
                {hasNoSearchResults ? (
                    <div className={s.noSearchResultsText}>Reitinsuuntia ei löytynyt.</div>
                ) : (
                    <>
                        {filteredRoutePaths.map((rpSegment, index) => {
                            if (
                                !this.state.areAllRoutePathsVisible &&
                                index >= ROUTE_PATH_SHOW_LIMIT
                            ) {
                                return null;
                            }
                            return this.renderRoutePathRow(rpSegment, `row-${index}`);
                        })}
                        {filteredRoutePaths.length > ROUTE_PATH_SHOW_LIMIT && (
                            <div
                                className={s.toggleAllRoutePathsVisibleButton}
                                onClick={this.toggleAllRoutePathsVisibility}
                            >
                                {!this.state.areAllRoutePathsVisible && (
                                    <div className={s.threeDots}>...</div>
                                )}
                                <div className={s.toggleAllRoutePathsVisibleText}>
                                    {this.state.areAllRoutePathsVisible
                                        ? `Piilota reitinsuunnat`
                                        : `Näytä kaikki reitinsuunnat (${filteredRoutePaths.length})`}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default RoutePathList;
