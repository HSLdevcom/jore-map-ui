import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import TransitToggleButtonBar from '../controls/TransitToggleButtonBar';
import LineItems from './LineItems';
import * as s from './lineSearch.scss';
import { RouteComponentProps } from 'react-router-dom';

interface MatchParams {
}

interface ILineSearchProps extends RouteComponentProps<MatchParams>{
    lineStore?: LineStore;
}

interface ILineSearchState {
    lineItems: any;
}

@inject('lineStore')
@observer
class LineSearch extends React.Component<ILineSearchProps, ILineSearchState> {
    constructor(props: ILineSearchProps) {
        super(props);
        this.state = {
            lineItems: '',
        };
        console.log(props);
        this.props.lineStore!.setSearchInput('');
    }

    public handleSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.props.lineStore!.setSearchInput(newValue);
    }

    public render(): any {
        console.log(this.props.location);
        return (
            <div className={s.lineSearchView}>
                <div className={s.inputContainer}>
                    <input
                        placeholder='Hae'
                        className={s.input}
                        type='text'
                        value={this.props.lineStore!.searchInput}
                        onChange={this.handleSearchInputChange}
                    />
                </div>
                { this.props.lineStore!.lineSearchVisible &&
                <div className={s.searchResultsContainer}>
                    <TransitToggleButtonBar
                        filters={this.props.lineStore!.filters || []}
                    />
                    <LineItems location={this.props.location}/>
                </div>
                }
            </div>
        );
    }
}

export default LineSearch;
