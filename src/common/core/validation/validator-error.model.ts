/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

/**
 * The unitary validator error built from a given reactive form ValidatorErrors object.
 *
 */
export class ValidatorError {

    /**
     * returns either the error message if not null, otherwise returns the validator error's name.
     *
     * @returns {string}
     */
    public getErrorMessageOrName() {
        return this.errorMessage? this.errorMessage: this.name;
    }

    /**
     *
     * @param {string} name the Validator Error like 'required', 'maxlength', 'pattern', ...
     * @param {string} errorMessage the human readable error message if any
     * @param errorValue the Validator Error value
     */
    constructor(public name: string, public errorMessage: string, public errorValue: any) {
    }
}
