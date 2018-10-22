/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Optional, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IDejaAction } from '../../../common/core/action.interface';
import { DejaClipboardService } from '../../../common/core/clipboard/clipboard.service';
import { IDragCursorInfos, IDragDropContext, IDropCursorInfos } from '../../mouse-dragdrop/mouse-dragdrop.service';
import { IDejaMouseDraggableContext } from '../../mouse-dragdrop/mouse-draggable.directive';
import { IDejaMouseDroppableContext } from '../../mouse-dragdrop/mouse-droppable.directive';
import { DejaComboListChildComponent } from '../component/combo-list-child/combo-list-child.component';
import { DejaComboListBase } from '../model/combo-list.base';

@Component({
    selector: 'deja-combo-list',
    templateUrl: './combo-list.component.html',
    styleUrls: ['./combo-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: DejaComboListComponent,
        multi: true,
    }],
})
export class DejaComboListComponent<T> extends DejaComboListBase<T> implements ControlValueAccessor {
    private _enableDragDrop = true;

    private _listUpdating = false;

    public set enableDragDrop(value: boolean) {
        this._enableDragDrop = coerceBooleanProperty(value);
    }

    public get enableDragDrop() {
        return this._enableDragDrop;
    }

    constructor(@Optional() private clipboardService: DejaClipboardService) {
        super();
    }

    // Select
    public toSelectListAction(listAction: IDejaAction): void {
        this.doAction(listAction, 'toggleSelectable', 'raiseOne');
    }

    // Deselect
    public selectedListAction(listAction: IDejaAction): void {
        this.doAction(listAction, 'toggleSelected', 'dropOne');
    }

    // ActionBar
    public actionBarAction(listAction: IDejaAction): void {
        if (listAction.type) {
            this.state[listAction.type]();
        }
    }

    public getDragContext(list: DejaComboListChildComponent<T>) {
        if (!this.clipboardService || !this.enableDragDrop) {
            return null;
        }

        return {
            target: '.mat-list-text',
            // target: 'mat-list-option',
            className: 'combo-list-cursor',
            dragStart: (element: HTMLElement) => {
                // Supprimer ou remplacer les lignes d'origine
                const dragedItemIndex = list.items.findIndex((item) => item[list.labelFieldName] === element.innerText);
                const dragedItem = list.items.splice(dragedItemIndex, 1, list.emptyItem)[0];
                this.clipboardService.set('dragedItem', dragedItem);
                return {
                    // Stocker les informations necessaires au drop
                    dragedItem: dragedItem,
                    dragedItemIndex: dragedItemIndex
                };
            },
        } as IDejaMouseDraggableContext;
    }

    public getDropContext(list: DejaComboListChildComponent<T>) {
        if (!this.clipboardService || !this.enableDragDrop) {
            return null;
        }

        const dragcallback = (dragContext: IDragDropContext, dragCursor: IDragCursorInfos) => {
            // Stocker les listes en cas d'annulation

            return {
                className: 'combo-list-cursor',
            } as IDropCursorInfos;
        };

        return {
            dragEnter: dragcallback,
            dragOver: (dragContext: IDragDropContext, dragCursor: IDragCursorInfos) => {
                if (!this._listUpdating) {
                    // Replacer les lignes drag dropée a l'endroit
                    const option = list.HitTest(dragCursor.originalEvent.pageX, dragCursor.originalEvent.pageY);
                    const hoveredItem = option.value as T;
                    // console.log('dragOver', option && option.value);
                    if (hoveredItem !== list.emptyItem) {
                        this._listUpdating = true;
                        // console.log('replacing', hoveredItem);
                        const items = [...list.items];
                        const emptyItemIndex = items.findIndex((item) => item === list.emptyItem);
                        items.splice(emptyItemIndex, 1);
                        const hoveredItemIndex = items.findIndex((item) => item === hoveredItem);
                        items.splice(hoveredItemIndex, 0, list.emptyItem);
                        setTimeout(() => {
                            // console.log('updating list');
                            list.items = [...items];
                            this._listUpdating = false;
                        }, 100);
                    }
                }
                return {
                    className: 'combo-list-cursor',
                } as IDropCursorInfos;
            },
            dragLeave: (dragContext: IDragDropContext) => {

            },
            drop: (dragContext: IDragDropContext) => {
                // console.log('drop');
                const items = [...list.items];
                const emptyItemIndex = items.findIndex((item) => item === list.emptyItem);
                items.splice(emptyItemIndex, 1, dragContext.dragedItem);
                setTimeout(() => {
                    // console.log('updating list after drop');
                    list.items = [...items];
                    this._listUpdating = false;
                }, 100);
                event.preventDefault();
            },
        } as IDejaMouseDroppableContext;
    }

    // action launcher
    private doAction(listAction: IDejaAction, singleAction: string, doubleAction: string) {
        if (listAction.type === 'single') {
            this.state[singleAction](listAction.payload);
        } else if (listAction.type === 'double') {
            this.state[doubleAction](listAction.payload);
        }

    }
}
