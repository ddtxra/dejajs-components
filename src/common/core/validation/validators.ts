/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {JsonUtils} from '../../util/JsonUtils';
import {ValidatorError} from './validator-error.model';

/**
 * Reactive form validation helper class.
 *
 */
export class DejaValidators {

    /**
     * Use this method to wrap a reactive form Validator function with the ability to define a human readable
     * validation error message that will be appended to the validation error returned the the Validator function.
     *
     * In example, if the Validator.required returns the following error {required: true}, then this wrapper
     * will append the message passed as an input parameter to the validation error and returns it like
     * that: {required: true, <formControlName>_message: <message>}.
     *
     * This feature is used by the component DejaValidatorMessagesComponent to display
     * human readable validation error messages.
     *
     * @param {Function} validatorFn an Angular Validator function of the form (c: AbstractControl): ValidationErrors|null
     * @param {string} errorMessage the human readable validation error message
     * @returns {(c: AbstractControl) => ValidationErrors}
     */
    public static wrapper(validatorFn: Function, errorMessage?: string): (c: AbstractControl) => ValidationErrors {
        return (c: AbstractControl): ValidationErrors|null => {
            const result = validatorFn(c);
            if (result) {
                const errorMap = JsonUtils.jsonObjectToMap(result);
                errorMap.forEach((_value: any, key: string) => {
                    result[`errorMessageFor_@${key}@`] = errorMessage;
                } );
            }
            return result;
        };
    }

    /**
     * Returns the human readable validation error message if any, if the Validator has been wrapped by using
     * the {@link wrapper} function, or return the raw validation error or undefined if there the given form
     * control does not have any validation errors at all.
     *
     * @param {FormGroup} form the parent reactiv FormGroup
     * @param {string} formControlName the name of the reactive form control
     * @returns {string} a human readable validation error provided throught the {@link wrapper} method
     * @see wrapper
     */
    public static getErrorMessage(form: FormGroup, formControlName: string) {
        const control = form.get(formControlName);
        return DejaValidators.getErrorMessageFromControl(control as FormControl);
    }

    /**
     * Returns the human readable validation error message if any, if the Validator has been wrapped by using
     * the {@link wrapper} function, or return the raw validation error or undefined if there the given form
     * control does not have any validation errors at all.
     *
     * @param {FormControl} control the reactive form control
     * @returns {string} the validation error
     */
    public static getErrorMessageFromControl(control: FormControl): string {
        if (control && control.errors) {
            const errors = Object.keys(control.errors);
            if (errors.length) {
                let error = errors[0];
                const errorMessageKey = `errorMessageFor_@${error}@`;
                if (control.errors.hasOwnProperty(errorMessageKey )) {
                    error = control.errors[errorMessageKey];
                }
                return error;
            }
        }
        return undefined;
    }

    /**
     * Returns the validation error as a Map by excluding any human readable validation error that have
     * been appended using the method {@link wrapper}.
     *
     * @param {ValidationErrors} error the validation error
     * @returns {Map<string, any>} a map with key's being the validation error's member name.
     * @see wrapper
     */
    public static getValidationErrorAsMap(error: ValidationErrors): Map<string, any> {
        if (error) {
            const map = JsonUtils.jsonObjectToMap(error);
            const resultMap = new Map<string, any>();
            for(const key of Array.from( map.keys()) ) {
                if (!key.startsWith('errorMessageFor_@')) {
                    resultMap[key] = map.get(key);
                }
            }
            return resultMap;
        }
        return null;
    }

    /**
     * Returns the ValidationErrors as an array of ValidatorError instances.
     *
     * @param {ValidationErrors} error the validation errors
     * to retrieve the human readable validation error message if any
     * @returns {Map<string, any>} an array of ValidatorError instances.
     * @see wrapper
     */
    public static getValidatorErrorsList(errors: ValidationErrors): ValidatorError[] {
        if (errors) {
            const map = JsonUtils.jsonObjectToMap(errors);
            const errorList: ValidatorError[] = [];
            for(const key of Array.from( map.keys()) ) {
                if (!key.startsWith('errorMessageFor_@')) {
                    let errorMessage: string = null;
                    const errorMessageKey = `errorMessageFor_@${key}@`;
                    if (errors.hasOwnProperty(errorMessageKey)) {
                        errorMessage = errors[errorMessageKey];
                    }
                    const validatorError: ValidatorError = new ValidatorError(key, errorMessage, map[key]);
                    errorList.push(validatorError);
                }
            }
            return errorList;
        }
        return null;
    }

}
