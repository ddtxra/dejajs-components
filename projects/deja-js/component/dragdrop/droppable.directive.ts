/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, HostBinding, Input, OnDestroy, Optional } from '@angular/core';
import { DejaClipboardService } from '@deja-js/core';
import { from as observableFrom, fromEvent as observableFromEvent, Subject } from 'rxjs';
import { filter, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { IDejaDragEvent } from './draggable.directive';

@Directive({
    selector: '[deja-droppable]',
})
export class DejaDroppableDirective implements OnDestroy {

    /**
     * @deprecated
     */
    @Input('continous-dragover')
    public set allEvents(value: boolean | string) {
        this._allEvents = coerceBooleanProperty(value);
    }

    @HostBinding('attr.droppable') public droppable: boolean = null;
    private draginfokey = 'draginfos';
    private objectKey = 'object';
    private droppedKey = 'dropped';
    private elementKey = 'element';
    private lastTarget: EventTarget;
    private lastAccept: boolean;
    private _allEvents = false;
    private _context: IDejaDropContext;
    private isAlive = true;

    @Input('deja-droppable')
    public set context(value: IDejaDropContext) {
        this._context = value;
        this.droppable = !!value ? true : null;
    }

    public get context() {
        return this._context;
    }

    constructor(elementRef: ElementRef, @Optional() private clipboardService: DejaClipboardService) {
        let inDrag = false;
        const element = elementRef.nativeElement as HTMLElement;
        const dragDrop$ = new Subject<DragEvent>();
        const kill$ = new Subject();

        const dragEnd$ = observableFrom(kill$).pipe(
            tap(() => inDrag = false),
            filter((value) => !value));

        observableFrom(dragDrop$).pipe(
            takeWhile(() => this.isAlive))
            .subscribe((dragEvent) => {
                if (dragEvent.type === 'dragenter') {
                    if (inDrag) {
                        return;
                    }
                    inDrag = true;

                    // console.log('DejaDragEnter');
                    if (this.context.dragentercallback) {
                        const dragInfos = this.clipboardService.get(this.draginfokey) as { [key: string]: any };
                        const e = dragEvent as IDejaDropEvent;
                        e.dragInfo = dragInfos;
                        e.dragObject = (<any>dragEvent)[this.objectKey];
                        e.dragElement = element;
                        e.itsMe = (<any>dragEvent)[this.elementKey] === element;
                        this.context.dragentercallback(e);
                        if (e.defaultPrevented) {
                            dragEvent.preventDefault();
                            dragEvent.dataTransfer.dropEffect = 'copy';
                        } else {
                            dragEvent.dataTransfer.dropEffect = 'none';
                        }

                        observableFromEvent(element, 'drop').pipe(
                            takeUntil(dragEnd$))
                            .subscribe((dropEvent: DragEvent) => {
                                // console.log('DejaDrop');
                                if (this.context.dropcallback) {
                                    if (dragInfos) {
                                        const evt = dropEvent as IDejaDropEvent;
                                        evt.dragInfo = dragInfos;
                                        evt.dragObject = dragInfos[this.objectKey];
                                        evt.dragElement = element;
                                        evt.itsMe = dragInfos[this.elementKey] === element;

                                        this.context.dropcallback(evt);
                                        if (evt.defaultPrevented) {
                                            evt.dragInfo[this.droppedKey] = true;
                                            dropEvent.preventDefault();
                                            dragEvent.dataTransfer.dropEffect = 'copy';
                                        } else {
                                            dragEvent.dataTransfer.dropEffect = 'none';
                                        }
                                    }
                                }
                                kill$.next();
                                return;
                            });

                        observableFromEvent(element, 'dragover').pipe(
                            takeUntil(dragEnd$))
                            .subscribe((overEvent: DragEvent) => {
                                // console.log('DejaDragOver');
                                if (!this._allEvents && this.lastTarget && this.lastTarget === overEvent.target) {
                                    if (this.lastAccept) {
                                        overEvent.preventDefault();
                                        dragEvent.dataTransfer.dropEffect = 'copy';
                                    } else {
                                        dragEvent.dataTransfer.dropEffect = 'none';
                                    }
                                    return;
                                }

                                if (this.context.dragovercallback) {
                                    if (dragInfos) {
                                        const evt = overEvent as IDejaDropEvent;
                                        evt.dragInfo = dragInfos;
                                        evt.dragObject = dragInfos[this.objectKey];
                                        evt.dragElement = element;
                                        evt.itsMe = dragInfos[this.elementKey] === element;

                                        this.context.dragovercallback(evt);
                                        this.lastTarget = overEvent.target;
                                        this.lastAccept = evt.defaultPrevented;
                                        if (evt.defaultPrevented) {
                                            overEvent.preventDefault();
                                            dragEvent.dataTransfer.dropEffect = 'copy';
                                        } else {
                                            dragEvent.dataTransfer.dropEffect = 'none';
                                        }
                                    }
                                }
                            });
                    }
                } else {
                    // console.log('DejaDragLeave');
                    if (this.context.dragleavecallback) {
                        const e = new CustomEvent('DejaDragLeave', { cancelable: true });
                        this.context.dragleavecallback(e);
                        if (e.defaultPrevented) {
                            dragEvent.preventDefault();
                        }
                    }
                    kill$.next();
                }
            });

        observableFromEvent(element, 'dragenter').pipe(
            takeWhile(() => this.isAlive),
            filter(() => !!this.context),
            filter(() => !!this.clipboardService.get(this.draginfokey)))
            .subscribe((event: DragEvent) => {
                if (!clipboardService) {
                    throw new Error('To use the DejaDroppableDirective, please import and provide the DejaClipboardService in your application.');
                }
                dragDrop$.next(event);
            });

        observableFromEvent(element, 'dragleave').pipe(
            takeWhile(() => this.isAlive),
            filter(() => !!this.context),
            filter(() => !!this.clipboardService.get(this.draginfokey)))
            .subscribe((leaveEvent: DragEvent) => {
                // console.log('dragleave ' + (leaveEvent.target as HTMLElement).tagName);
                const bounds = element.getBoundingClientRect();
                const inside = leaveEvent.x >= bounds.left && leaveEvent.x <= bounds.right && leaveEvent.y >= bounds.top && leaveEvent.y <= bounds.bottom;
                if (!inside) {
                    dragDrop$.next(leaveEvent);
                }
            });
    }

    public ngOnDestroy() {
        this.isAlive = true;
    }
}

export interface IDejaDropEvent extends IDejaDragEvent {
    itsMe: boolean;
}

export interface IDejaDropContext {
    dragentercallback(event: IDejaDropEvent): void;
    dropcallback?(event: IDejaDropEvent): void;
    dragovercallback?(event: IDejaDropEvent): void;
    dragleavecallback?(event: CustomEvent): void;
}
