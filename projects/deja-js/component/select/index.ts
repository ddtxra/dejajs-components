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
import { MatIconModule, MatInputModule } from '@angular/material';
import { DejaChipsModule } from '@deja-js/component/chips';
import { DejaListLoaderModule } from '@deja-js/component/loaders';
import { DejaOverlayModule } from '@deja-js/component/overlay';
import { DejaChildValidatorModule, DejaItemModule, MediaModule } from '@deja-js/core';
import { DejaSelectComponent } from './select.component';

@NgModule({
    declarations: [
        DejaSelectComponent,
    ],
    exports: [
        DejaSelectComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        MediaModule,
        DejaOverlayModule,
        MatIconModule,
        MatInputModule,
        DejaChildValidatorModule,
        DejaChipsModule,
        DejaItemModule,
        DejaListLoaderModule,
    ],
})
export class DejaSelectModule { }

export * from './select.component';
