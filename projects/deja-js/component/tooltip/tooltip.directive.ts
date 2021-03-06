/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { DejaConnectionPositionPair } from '@deja-js/core';
import { fromEvent as observableFromEvent, of as observableOf } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { DejaTooltipService } from './tooltip.service';

@Directive({
    selector: '[deja-tooltip]',
})
export class DejaTooltipDirective {
    @Input('tooltip-delay') public delay = 600;
    @Input('tooltip-model') public model: any;
    @Input('deja-tooltip') public name: string;
    @Input('tooltip-positions') public positions: DejaConnectionPositionPair | string;

    // tslint:disable-next-line:no-output-rename
    @Output('tooltip-show') public show = new EventEmitter();

    constructor(elementRef: ElementRef, tooltipService: DejaTooltipService) {
        const element = elementRef.nativeElement as HTMLElement;

        const leave$ = observableFromEvent(element, 'mouseleave');

        observableFromEvent(element, 'mouseenter').pipe(
            switchMap((e) => observableOf(e).pipe(delay(this.delay), takeUntil(leave$))))
            .subscribe(() => {
                tooltipService.params[this.name] = {
                    model: this.model,
                    ownerElement: elementRef,
                    positions: this.positions,
                };

                this.show.emit();
            });
    }
}
