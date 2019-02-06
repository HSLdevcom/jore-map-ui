import React from 'react';
import Dropdown from './Dropdown';
import nodeTypes from '../../dictionaries/nodeTypes';

interface IMunicipalityDropdownProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    label: string;
}

const nodeTypeDropdown = ({ value, onChange, disabled, label }: IMunicipalityDropdownProps) => (
    <Dropdown
        disabled={disabled}
        items={
            Object.keys(nodeTypes).map(
                key => ({ key, value: nodeTypes[key] }),
            )
        }
        label={label}
        selected={nodeTypes[value]}
        onChange={onChange}
    />
);

export default nodeTypeDropdown;
