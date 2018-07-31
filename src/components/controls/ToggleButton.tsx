import * as React from 'react';

interface IToggleButtonProps {
    type: string;
}

class ToggleButton extends React.Component<IToggleButtonProps, {}> {
    public render(): any {
        return (
            <div>
              <label className={'switch'}>
                  <input type='checkbox'/>
                  <div
                    className={'slider ' + this.props.type}
                  />
              </label>
            </div>
        );
    }
}

export default ToggleButton;
