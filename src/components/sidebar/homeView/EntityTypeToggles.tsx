import React from 'react';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { IoMdAnalytics, IoMdLocate } from 'react-icons/io';
import { SearchStore } from '~/stores/searchStore';
import * as s from './entityTypeToggles.scss';

interface IEntityTypeToggleProps {
    searchStore?: SearchStore;
}

@inject('searchStore')
@observer
class EntityTypeToggles extends React.Component<IEntityTypeToggleProps> {
    private toggleSearchingLines = () => {
        this.props.searchStore!.toggleIsSearchingForLines();
    }

    private toggleSearchingNodes = () => {
        this.props.searchStore!.toggleIsSearchingForNodes();
    }

    render() {
        return (
          <div className={s.entityTypeTogglesView}>
            <div className={s.buttonContainer}>
              <div
                  className={classnames(
                      s.button,
                      this.props.searchStore!.isSearchingForLines ? s.active : null,
                  )}
                  onClick={this.toggleSearchingLines}
              >
              <IoMdAnalytics />
                <div>
                Linjat ja Reitit
                </div>
              </div>
            </div>
            <div className={s.buttonContainer}>
              <div
                className={classnames(
                    s.button,
                    this.props.searchStore!.isSearchingForNodes ? s.active : null,
                )}
                onClick={this.toggleSearchingNodes}
              >
                <IoMdLocate />
                <div>
                  Solmut
                </div>
              </div>
            </div>
          </div>
        );
    }
}

export default EntityTypeToggles;
