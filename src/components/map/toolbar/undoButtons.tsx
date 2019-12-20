import { observer } from 'mobx-react';
import React from 'react';
import { IoMdRedo, IoMdUndo } from 'react-icons/io';
import LoginStore from '~/stores/loginStore';
import EventManager from '~/util/EventManager';
import MapControlButton from '../mapControls/MapControlButton';

@observer
class UndoButtons extends React.Component {
    private undo = () => {
        EventManager.trigger('undo');
    };

    private redo = () => {
        EventManager.trigger('redo');
    };

    render() {
        if (!LoginStore.hasWriteAccess) return null;

        return (
            <>
                <MapControlButton
                    onClick={this.undo}
                    isActive={false}
                    isDisabled={false}
                    label='Kumoa (ctrl+z)'
                >
                    <IoMdUndo />
                </MapControlButton>
                <MapControlButton
                    onClick={this.redo}
                    isActive={false}
                    isDisabled={false}
                    label='Tee uudestaan (ctrl+y)'
                >
                    <IoMdRedo />
                </MapControlButton>
            </>
        );
    }
}
export default UndoButtons;
