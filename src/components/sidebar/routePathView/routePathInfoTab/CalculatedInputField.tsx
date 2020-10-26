import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ButtonType from '~/enums/buttonType';
import { IRoutePathLink } from '~/models';
import { RoutePathStore } from '~/stores/routePathStore';
import { IValidationResult } from '~/validation/FormValidator';
import Button from '../../../controls/Button';
import InputContainer from '../../../controls/InputContainer';
import Loader from '../../../shared/loader/Loader';
import * as s from './calculatedInputField.scss';

interface ICalculatedInputFieldProps {
    routePathLinks: IRoutePathLink[];
    label: string;
    value: number;
    isDisabled: boolean;
    validationResult?: IValidationResult;
    onChange: (value: number) => void;
    isRoutePathCalculatedLengthLoading: boolean;
    routePathStore?: RoutePathStore;
}

const CalculatedInputField = inject('routePathStore')(
    observer((props: ICalculatedInputFieldProps) => {
        const useCalculatedLength = () => {
            const calculatedRoutePathLength = props.routePathStore!.calculatedRoutePathLength;
            if (calculatedRoutePathLength && !props.isRoutePathCalculatedLengthLoading) {
                props.routePathStore!.updateRoutePathProperty('length', calculatedRoutePathLength);
            }
        };

        const calculatedRoutePathLength = props.routePathStore!.calculatedRoutePathLength;
        const isRoutePathLengthFormedByMeasuredLengths = props.routePathStore!
            .isRoutePathLengthFormedByMeasuredLengths;
        return (
            <div className={s.calculateInputFieldView}>
                <InputContainer
                    label={props.label}
                    value={props.value}
                    disabled={props.isDisabled}
                    type='number'
                    onChange={props.onChange}
                    validationResult={props.validationResult}
                />
                <Button
                    disabled={props.isDisabled}
                    onClick={useCalculatedLength}
                    type={ButtonType.SQUARE}
                    className={s.calulateButton}
                >
                    Laske
                    <div className={s.routePathLength}>
                        {props.isRoutePathCalculatedLengthLoading ? (
                            <Loader size='tiny' hasNoMargin={true} />
                        ) : calculatedRoutePathLength ? (
                            `${calculatedRoutePathLength}m`
                        ) : (
                            '-'
                        )}
                        {isRoutePathLengthFormedByMeasuredLengths ? (
                            <FaCheckCircle className={s.isMeasuredLength} />
                        ) : (
                            <FaExclamationCircle className={s.isNotMeasuredLength} />
                        )}
                    </div>
                </Button>
            </div>
        );
    })
);

export default CalculatedInputField;
