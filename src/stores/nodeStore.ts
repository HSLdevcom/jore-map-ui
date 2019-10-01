import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeStopFactory from '~/factories/nodeStopFactory';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import { roundLatLng } from '~/util/geomHelper';
import NodeMeasurementType from '~/enums/nodeMeasurementType';

export interface UndoState {
    links: ILink[];
    node: INode;
}

export class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _oldNode: INode | null;
    @observable private _oldLinks: ILink[];
    @observable private _isStopFormValid: boolean;
    @observable private _isEditingDisabled: boolean;
    private _geometryUndoStore: GeometryUndoStore<UndoState>;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
        this._geometryUndoStore = new GeometryUndoStore();
        this._isEditingDisabled = true;
    }

    @computed
    get links() {
        return this._links;
    }

    @computed
    get node() {
        return this._node!;
    }

    @computed
    get isDirty() {
        return (
            !_.isEqual(this._node, this._oldNode) ||
            !_.isEqual(this._links, this._oldLinks)
        );
    }

    @computed
    get isStopFormValid() {
        return this._isStopFormValid;
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = (node: INode, links: ILink[]) => {
        const newNode = _.cloneDeep(node);
        const newLinks = _.cloneDeep(links);

        this.clear();
        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._node = newNode;
        this._oldNode = newNode;
        this._links = newLinks;
        this._oldLinks = newLinks;
    };

    @action
    public setCurrentStateAsOld = () => {
        this._oldLinks = _.cloneDeep(this._links);
        this._oldNode = _.cloneDeep(this._node);
    };

    @action
    public changeLinkGeometry = (latLngs: L.LatLng[], index: number) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newLinks = _.cloneDeep(this._links);
        newLinks[index].geometry = latLngs;
        const currentUndoState: UndoState = {
            links: newLinks,
            node: this._node
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._links = newLinks;
    };

    @action
    public updateNodeGeometry = (
        nodeLocationType: NodeLocationType,
        newCoordinates: LatLng,
        measurementType: NodeMeasurementType
    ) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newNode = _.cloneDeep(this._node);
        const newLinks = _.cloneDeep(this._links);

        newNode[nodeLocationType] = roundLatLng(newCoordinates);

        if (nodeLocationType === 'coordinates') this.mirrorCoordinates(newNode);

        const coordinatesProjection = newNode.coordinatesProjection;
        // Update the first link geometry of startNodes to coordinatesProjection
        newLinks
            .filter(link => link.startNode.id === newNode!.id)
            .map(link => (link.geometry[0] = coordinatesProjection));
        // Update the last link geometry of endNodes to coordinatesProjection
        newLinks
            .filter(link => link.endNode.id === newNode!.id)
            .map(
                link =>
                    (link.geometry[
                        link.geometry.length - 1
                    ] = coordinatesProjection)
            );

        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._links = newLinks;
        const geometryVariables: NodeLocationType[] = [
            'coordinates',
            'coordinatesManual',
            'coordinatesProjection'
        ];
        geometryVariables.forEach(
            coordinateName =>
                (this._node![coordinateName] = newNode[coordinateName])
        );

        if (nodeLocationType === 'coordinates') {
            this.updateNode('measurementType', measurementType.toString());
        }
    };

    @action
    public mirrorCoordinates = (node: INode) => {
        if (node.type !== NodeType.STOP) {
            node.coordinatesProjection = node.coordinates;
            node.coordinatesManual = node.coordinates;
        }
    };

    @action
    public updateNode = (
        property: keyof INode,
        value: string | Date | LatLng
    ) => {
        if (!this._node) return;

        this._node[property] = value;

        if (property === 'type') this.mirrorCoordinates(this._node);

        if (this._node.type === NodeType.STOP && !this._node.stop) {
            this._node.stop = NodeStopFactory.createNewStop();
        }
    };

    @action
    public updateStop = (property: string, value: string | number | Date) => {
        if (!this.node) return;
        this._node!.stop = {
            ...this._node!.stop!,
            [property]: value
        };
    };

    @action
    public setIsStopFormValid = (isStopFormValid: boolean) => {
        this._isStopFormValid = isStopFormValid;
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._geometryUndoStore.clear();
    };

    @action
    public resetChanges = () => {
        if (this._oldNode) {
            this.init(this._oldNode, this._oldLinks);
        }
    };

    @action
    public undo = () => {
        this._geometryUndoStore.undo((previousUndoState: UndoState) => {
            this._links! = previousUndoState.links;
            this._node!.coordinates = previousUndoState.node.coordinates;
            this._node!.coordinatesManual =
                previousUndoState.node.coordinatesManual;
            this._node!.coordinatesProjection =
                previousUndoState.node.coordinatesProjection;
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((nextUndoState: UndoState) => {
            this._links! = nextUndoState.links;
            this._node!.coordinates = nextUndoState.node.coordinates;
            this._node!.coordinatesManual =
                nextUndoState.node.coordinatesManual;
            this._node!.coordinatesProjection =
                nextUndoState.node.coordinatesProjection;
        });
    };

    public getDirtyLinks() {
        // All links are dirty if the node coordinate has changed
        if (
            !_.isEqual(
                this._node!.coordinatesProjection,
                this._oldNode!.coordinatesProjection
            )
        ) {
            return this._links;
        }
        return this._links.filter(link => {
            const oldLink = this._oldLinks.find(
                oldLink =>
                    oldLink.transitType === link.transitType &&
                    oldLink.startNode.id === link.startNode.id &&
                    oldLink.endNode.id === link.endNode.id
            );
            return !_.isEqual(link, oldLink);
        });
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
