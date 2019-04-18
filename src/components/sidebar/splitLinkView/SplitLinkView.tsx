import React from 'react';
import classnames from 'classnames';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { MapStore } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { LinkStore } from '~/stores/linkStore';
import { NodeStore } from '~/stores/nodeStore';
import { ILink, INode } from '~/models';
import { RouteComponentProps } from 'react-router';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import Loader from '~/components/shared/loader/Loader';
import * as s from './splitLinkView.scss';
import SidebarHeader from '../SidebarHeader';

interface ISplitLinkViewState {
    isLoading: boolean;
    link: ILink | null;
    node: INode | null;
    selectedDate: Date | null;
}

interface ISplitLinkViewProps extends RouteComponentProps<any>{
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    linkStore?: LinkStore;
    nodeStore?: NodeStore;
}

@inject('mapStore', 'errorStore', 'linkStore', 'nodeStore')
@observer
class SplitLinkView extends React.Component<ISplitLinkViewProps, ISplitLinkViewState> {
    constructor(props: ISplitLinkViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            link: null,
            node: null,
            selectedDate: null,
        };
    }

    private init = async () => {
        this.setState({ isLoading: true });

        const [
            linkStartNodeId,
            linkEndNodeId,
            linkTransitType,
            nodeId,
        ] = this.props.match!.params.id.split(',');
        try {
            if (linkStartNodeId && linkEndNodeId && linkTransitType && nodeId) {
                const link = await LinkService.fetchLink(
                    linkStartNodeId, linkEndNodeId, linkTransitType,
                );
                const node = await NodeService.fetchNode(nodeId);
                this.setState({
                    link,
                    node,
                });
                this.props.linkStore!.setLink(link);
                this.props.linkStore!.setIsLinkGeometryEditable(false);
                this.props.linkStore!.setNodes([node]);
                const bounds = L.latLngBounds(link.geometry);
                bounds.extend(node.coordinates);
                this.props.mapStore!.setMapBounds(bounds);
            }
        } catch (e) {
            this.props.errorStore!.addError(
                    // tslint:disable-next-line:max-line-length
                    `Haku löytää linkin ja solmun joka olet valinnut epäonnistui`,
                    e,
                );
        }
        this.setState({ isLoading: false });
    }

    componentDidMount() {
        this.init();
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.splitLinkView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        return (
            <div className={s.splitLinkView}>
                <div className={s.content}>
                    <SidebarHeader>
                        Linkin jako
                    </SidebarHeader>
                </div>
                Linkin jakoo
                {!this.state.isLoading && this.state.node && this.state.node.id

                }
            </div >
        );
    }
}
export default SplitLinkView;
