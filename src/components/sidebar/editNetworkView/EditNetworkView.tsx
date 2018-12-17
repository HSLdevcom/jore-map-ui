import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { match } from 'react-router';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import { NetworkStore } from '~/stores/networkStore';
import { NotificationStore } from '~/stores/notificationStore';
import { RouteStore } from '~/stores/routeStore';
import NotificationType from '~/enums/notificationType';
import Navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import * as s from './editNetworkView.scss';

interface IEditNetworkViewProps {
    match?: match<any>;
    editNetworkStore?: EditNetworkStore;
    networkStore?: NetworkStore;
    notificationStore?: NotificationStore;
    routeStore?: RouteStore;
}

@inject('editNetworkStore', 'networkStore', 'notificationStore', 'routeStore')
@observer
class EditNetworkView extends React.Component<IEditNetworkViewProps> {
    constructor(props: IEditNetworkViewProps) {
        super(props);

        this.initStores();
    }

    componentDidMount() {
        this.fetchNodesAndLinks();
    }

    private initStores() {
        this.props.networkStore!.selectAllTransitTypes();
        this.props.networkStore!.setNodeVisibility(true);
        this.props.networkStore!.setLinkVisibility(true);
        this.props.networkStore!.setPointVisibility(true);
        this.props.routeStore!.clearRoutes();
    }

    componentWillReceiveProps(props: IEditNetworkViewProps) {
        this.fetchNodesAndLinks();
    }

    private async fetchNodesAndLinks() {
        const queryParamNodeId = Navigator.getQueryParam(QueryParams.node);
        const currentNode = this.props.editNetworkStore!.node;
        if (currentNode && currentNode.id === queryParamNodeId) return;

        const node = await NodeService.fetchNode(queryParamNodeId);
        if (!node) {
            this.props.notificationStore!.addNotification({
                message: `Solmua (soltunnus: ${queryParamNodeId}) ei löytynyt.`,
                type: NotificationType.ERROR,
            });
            return;
        }

        const links = await LinkService.fetchLinksByStartNodeAndEndNode(node.id);
        if (!links || links.length === 0) {
            this.props.notificationStore!.addNotification({
                message: `Tästä solmusta (soltunnus: ${node.id}) alkavia linkkejä ei löytynyt.`,
                type: NotificationType.WARNING,
            });
            return;
        }

        this.props.editNetworkStore!.setNode(node);
        this.props.editNetworkStore!.setLinks(links);
    }

    public render() {
        const node = this.props.editNetworkStore!.node;
        if (node && node.id) {
            return (
                <div className={s.editNetworkView}>
                   <h2>Solmun {node.id} muokkaus</h2>
                </div>
            );
        }

        return (
            <div className={s.editNetworkView}>
               <h2>Solmun muokkaus</h2>
            </div>
        );
    }
}

export default EditNetworkView;
