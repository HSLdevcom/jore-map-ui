import { action, computed, observable } from 'mobx';
import apolloClient from '../util/ApolloClient';
import { ILine } from '../models';
import gql from 'graphql-tag';
import lineHelper from '../util/lineHelper';
import { ApolloQueryResult } from 'apollo-client';

export class SidebarStore {
    @observable private _filters: string[];
    @observable private _selectedLines: ILine[];
    @observable private _allLines: ILine[];

    constructor() {
        this._selectedLines = [];
        this._allLines = [];
    }

    @computed get selectedLines(): ILine[] {
        return this._selectedLines;
    }

    @computed get filters(): string[] {
        return this._filters;
    }

    set filters(filters: string[]) {
        this._filters = filters;
    }

    @action
    public addSelectedLine(node: ILine) {
        this._selectedLines.push(node);
    }

    @action
    public removeSelectedLines() {
        this._selectedLines = [];
    }

    @computed get allLines(): ILine[] {
        return this._allLines;
    }

    @action
    private setAllLines(lines: ILine[]) {
        this._allLines = lines;
    }

    @action
    public fetchAllLines() {
        apolloClient.query({ query: getLinjas })
            .then((res: ApolloQueryResult<any>) => {
                const allLines = res.data.allLinjas.nodes.map(((node: any) => {
                    const routeNumber = lineHelper.getReiTunnus(node.reittisByLintunnus.edges[0]);
                    const lineNumber = lineHelper.parseLineNumber(node.lintunnus);

                    return <ILine>{
                        routeNumber,
                        lineNumber,
                        lineId: node.lintunnus,
                        lineLayer: node.linverkko,
                    };
                }));

                this.setAllLines(allLines);
            });
    }

}

const getLinjas = gql`
{
  allLinjas {
    nodes {
      lintunnus
      linjoukkollaji
      linverkko
      reittisByLintunnus(first: 1, orderBy: REIVIIMPVM_DESC) {
        edges {
          node {
            reinimi
            reiviimpvm
          }
        }
      }
    }
  }
}
`;

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
