import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import * as s from './lineSearch.scss';

interface ILineSearchProps {
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
        this.props.lineStore!.setSearchInput('');
    }

    public handleSearchInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        this.props.lineStore!.setSearchInput(newValue);
    }

    public render(): any {
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
            </div>
        );
    }
}

export default LineSearch;
