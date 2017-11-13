/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */
import { Component, Input } from '@angular/core';
import {FormControl, ValidationErrors} from '@angular/forms';
import {ValidatorError} from '../../common/core/validation/validator-error.model';
import {DejaValidators} from '../../common/core/validation/validators';

/**
 * Deja Validator Message Component for Angular
 *
 * This component allow you display Reactive Form Validation error messages.
 */
@Component({
    selector: 'deja-validator-messages',
    templateUrl: 'validator-messages.component.html',
    styleUrls: ['validator-messages.component.scss'],
})
export class DejaValidatorMessagesComponent {

    /**
     * The form control
     */
    @Input() public control: FormControl;

    /**
     * The form control name
     */
    @Input() public controlName: string;

    @Input() public errorMessageFn: Function;

    @Input() public displayErrorMessageOnly = true;

    constructor() {
    }

    protected getErrorMessages() {
        if (this.control) {
            let error: string = null;
            if (this.errorMessageFn && this.controlName) {
                error = this.errorMessageFn(this.controlName, this.control);
            } else {
                error = DejaValidators.getErrorMessageFromControl(this.control);
            }
            return error;
        }
        return undefined;
    }

    protected getValidationErrors(): Array<ValidatorError> {
        if (!this.control) {
            return null;
        }
        return this._getValidationErrors(this.control.errors);
    }

    /**
     * convert a ValidationError to as Map<string, any>.
     *
     * @param {ValidationErrors} validationErrors the validation error
     * @returns {Map<string, any>} the validation error as map or null if the validationErrors is
     * null or undefined
     */
    protected _getValidationErrors(validationErrors: ValidationErrors): Array<ValidatorError> {
        if (validationErrors) {
            return DejaValidators.getValidatorErrorsList(validationErrors);
        }
        return null;
    }

}
