/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { Color } from '@deja-js/component';
import { IRange } from '@deja-js/component';
import { Country } from '../../services/countries.service';

export interface IUser {
    name: string;                       // matInput
    country: Country;                   // DejaSelect
    visitedCountries: Country[];        // DejaSelect => MultiSelect
    birthDate: Date;                    // DejaDatePicker && DejaDateSelector
    preferedJuice: string;              // DejaSelect => String model and items
    preferedFruct: string;              // DejaTreeList
    size: number;                       // DejaCircularPicker
    color: Color;                       // DejaColor Selector
    color2: Color;                      // DejaColorPicker
    skills: string[];                   // DejaChips
    remark: string;                     // DejaContentEditable
    bio: string;                        // DejaEditor
    ranges: IRange[];                   // DejaRange
}
