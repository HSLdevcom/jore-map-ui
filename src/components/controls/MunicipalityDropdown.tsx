import React from 'react';
import Dropdown from './Dropdown';
import municipalities from '../../dictionaries/municipalities';

interface IMunicipalityDropdownProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    label: string;
}

const municipalityDropdown = ({ value, onChange, disabled, label }: IMunicipalityDropdownProps) => (
    <Dropdown
        disabled={disabled}
        items={
            Object.keys(
                municipalities,
            ).map(
                key => ({
                    key,
                    value: municipalities[key],
                }),
            )
        }
        label={label}
        selected={municipalities[value]}
        onChange={onChange}
    />
);

export default municipalityDropdown;
