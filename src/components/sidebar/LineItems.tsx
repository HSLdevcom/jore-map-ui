import gql from 'graphql-tag';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Query } from 'react-apollo';
import { SidebarStore } from '../../stores/sidebarStore';
import lineHelper from '../../util/lineHelper';
import LineItem from './LineItem';

interface ILineItemsProps {
    sidebarStore?: SidebarStore;
    searchInput: string;
    filters: string[];
}

@inject('sidebarStore')
@observer
class LineItems extends React.Component<ILineItemsProps> {

    public checkFilters = (description: string, lineNumber: string, transitTypeCode: string) => {
        const transitType = lineHelper.convertTransitTypeCodeToTransitType(transitTypeCode);
        const searchTargetAttributes = description.toLowerCase() + lineNumber;

        if (this.props.filters.indexOf(transitType) !== -1) {
            return false;
        }
        if (searchTargetAttributes.includes(this.props.searchInput)) {
            return true;
        }
        return false;
    }

    public render(): any {
        return (
        <Query query={getLinjas}>
          {({ loading, data }) => {
              if (loading) {
                  return 'Fetching';
              }

              return data.allLinjas.nodes.map((node: any) => {
                  const description = lineHelper.getReiTunnus(node.reittisByLintunnus.edges[0]);
                  const lineNumber = lineHelper.parseLineNumber(node.lintunnus);

                  if (!this.checkFilters(description, lineNumber, node.linverkko)) {
                      return;
                  }
                  return (
                <LineItem
                  key={node.lintunnus}
                  description={description}
                  lineNumber={node.lintunnus}
                  transitCode={node.linverkko}
                />
                  );
              });
          }}
        </Query>
        );
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

export default LineItems;
