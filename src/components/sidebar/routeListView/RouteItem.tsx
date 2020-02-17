import { inject, observer } from 'mobx-react';
import React from 'react';
import { ContentItem, ContentList, Tab, Tabs, TabList } from '~/components/shared/Tabs';
import { IRoute } from '~/models';
import { RouteListStore } from '~/stores/routeListStore';
import RoutePathListTab from './RoutePathListTab';
import RouteTab from './RouteTab';

interface IRouteItemProps {
    route: IRoute;
    selectedTabIndex: number;
    areAllRoutePathsVisible: boolean;
    isEditingDisabled: boolean;
    routeListStore?: RouteListStore;
}

@inject('routeListStore', 'mapStore')
@observer
class RouteItem extends React.Component<IRouteItemProps> {
    private setSelectedTabIndex = (index: number) => {
        this.props.routeListStore!.setSelectedTabIndex(this.props.route.id, index);
    };

    private toggleAllRoutePathsVisible = () => {
        this.props.routeListStore!.toggleAllRoutePathsVisible(this.props.route.id);
    };

    render() {
        const isEditingDisabled = this.props.isEditingDisabled;
        return (
            <Tabs>
                <TabList
                    selectedTabIndex={this.props.selectedTabIndex}
                    setSelectedTabIndex={this.setSelectedTabIndex}
                >
                    <Tab>
                        <div>Reitinsuunnat</div>
                    </Tab>
                    <Tab>
                        <div>Reitin tiedot</div>
                    </Tab>
                </TabList>
                <ContentList selectedTabIndex={this.props.selectedTabIndex}>
                    <ContentItem>
                        <RoutePathListTab
                            key={this.props.route.id}
                            route={this.props.route}
                            areAllRoutePathsVisible={this.props.areAllRoutePathsVisible}
                            toggleAllRoutePathsVisible={this.toggleAllRoutePathsVisible}
                        />
                    </ContentItem>
                    <ContentItem>
                        <RouteTab
                            route={this.props.route}
                            isEditingDisabled={isEditingDisabled}
                            isNewRoute={false}
                        />
                    </ContentItem>
                </ContentList>
            </Tabs>
        );
    }
}

export default RouteItem;
