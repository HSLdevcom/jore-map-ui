
import * as React from 'react';
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
    listObjectReferences: any;
    listReference: React.RefObject<HTMLDivElement>;

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
        this.listReference = React.createRef<HTMLDivElement>();
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
            console.log('list');
            console.log(this.listReference);
            console.log(extendedObjects[0]);
            console.log(this.listObjectReferences[extendedObjects[0]]);
            const id = extendedObjects[0];
            const item = this.listObjectReferences[id].current;
            const parentHeight = this.listReference.current!.offsetHeight;
            this.listReference.current!.scrollTo({
                top: item.offsetTop - (parentHeight / 2) - (item.offsetHeight / 2),
                behavior: 'smooth',
            });
        }
    }

    save = () => {
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

    public render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        return (
            <div className={s.routePathLinksView}>
                <div
                    className={s.contentWrapper}
                    ref={this.listReference}
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
