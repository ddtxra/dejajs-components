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
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';

import { DejaChildValidatorModule, DejaTextMetricsModule } from '@deja-js/core';
import { DejaNumericStepperComponent } from './numeric-stepper.component';

@NgModule({
    imports: [
        CommonModule,
        DejaChildValidatorModule,
        DejaTextMetricsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
    ],
    exports: [
        DejaNumericStepperComponent,
    ],
    declarations: [
        DejaNumericStepperComponent,
    ],
})
export class DejaNumericStepperModule { }

export * from './numeric-stepper.component';
