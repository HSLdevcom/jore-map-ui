import React from 'react';
import ToolbarTools from '../../../enums/toolbarTools';

const submenus = {
    edit: (
        <div>
            Voit nyt raahata solmut ja pysäkit kartalla.
        </div>
    ),
};

const getSubmenu = (tool: ToolbarTools): JSX.Element | null => {
    switch (tool) {
    case ToolbarTools.Edit:
        return submenus.edit;
    default:
        return null;
    }
};

export {
    getSubmenu,
};
