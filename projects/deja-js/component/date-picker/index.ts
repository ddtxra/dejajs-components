/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatInputModule } from '@angular/material';
import { DejaDateSelectorModule } from '@deja-js/component/date-selector';
import { DejaOverlayModule } from '@deja-js/component/overlay';
import { DejaChildValidatorModule } from '@deja-js/core';
import { TextMaskModule } from 'angular2-text-mask';
import { DejaDatePickerComponent } from './date-picker.component';

@NgModule({
    declarations: [DejaDatePickerComponent],
    exports: [DejaDatePickerComponent],
    imports: [
        CommonModule,
        FormsModule,
        DejaOverlayModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        DejaChildValidatorModule,
        DejaDateSelectorModule,
        TextMaskModule,
    ],
})
export class DejaDatePickerModule { }

export * from './format-to-mask';
export * from './date-picker.component';
