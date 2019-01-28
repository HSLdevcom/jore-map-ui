
import React from 'react';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import { IRoutePath, IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import s from './routePathLinksTab.scss';
import RoutePathListNode from './RoutePathListNode';
import RoutePathListLink from './RoutePathListLink';

interface IRoutePathLinksTabProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
}

@inject('routePathStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps>{
    reactionDisposer: IReactionDisposer;
    listObjectReferences: { [id: string] : React.RefObject<HTMLDivElement> } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
    }

    private renderList = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.map((routePathLink, index) => {
            this.listObjectReferences[routePathLink.startNode.id] = React.createRef();
            this.listObjectReferences[routePathLink.id] = React.createRef();
            const res =  [
                (
                    <RoutePathListNode
                        key={`${routePathLink.id}-${index}-startNode`}
                        reference={this.listObjectReferences[routePathLink.startNode.id]}
                        node={routePathLink.startNode}
                        routePathLink={routePathLink}
                    />
                ), (
                    <RoutePathListLink
                        key={`${routePathLink.id}-${index}-link`}
                        reference={this.listObjectReferences[routePathLink.id]}
                        routePathLink={routePathLink}
                    />
                )];

            if (index === routePathLinks.length - 1) {
                this.listObjectReferences[routePathLink.endNode.id] = React.createRef();
                res.push(
                    <RoutePathListNode
                        key={`${routePathLink.id}-${index}-endNode`}
                        reference={this.listObjectReferences[routePathLink.endNode.id]}
                        node={routePathLink.endNode}
                        routePathLink={routePathLink}
                    />,
                );
            }
            return res;
        });
    }

    private onExtend = () => {
        const extendedObjects = this.props.routePathStore!.extendedObjects;
        if (extendedObjects.length === 1) {
            const id = extendedObjects[0];
            const item = this.listObjectReferences[id].current!;
            item.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    private save = () => {
    }

    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.props.routePathStore!.extendedObjects,
            this.onExtend,
        );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        return (
            <div className={s.routePathLinksView}>
                <div
                    className={s.contentWrapper}
                >
                    {this.renderList(routePathLinks)}
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={true}
                    onClick={this.save}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default RoutePathLinksTab;
