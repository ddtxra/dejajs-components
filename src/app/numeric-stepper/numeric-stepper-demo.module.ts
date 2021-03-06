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
import { MatFormFieldModule, MatTabsModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DejaNumericStepperModule } from '@deja-js/component/numeric-stepper';
import { DejaMarkdownModule } from '../../component/markdown/index';
import { DejaNumericStepperDemoComponent } from './numeric-stepper-demo.component';
import { routing } from './numeric-stepper-demo.routes';

@NgModule({
    declarations: [DejaNumericStepperDemoComponent],
    exports: [DejaNumericStepperDemoComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatTabsModule,
        MatToolbarModule,
        MatFormFieldModule,
        DejaNumericStepperModule,
        DejaMarkdownModule,
        routing,
    ],
    providers: [
    ],
})
export class DejaNumericStepperDemoModule { }
