/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DejaClipboardModule, Rect } from '@deja-js/core';
import { BehaviorSubject, from as observableFrom } from 'rxjs';
import { debounceTime, delay, filter, first, map, tap } from 'rxjs/operators';
import { DejaTileBorderDirection, DejaTileGroupComponent, DejaTilesModule } from './index';
import { DejaTileGroup } from './tile-group.class';
import { DejaTile } from './tile.class';
import { DejaTilesLayoutProvider } from './tiles-layout.provider';
import { DejaTilesComponent } from './tiles.component';

const padding = 4;

@Component({
    encapsulation: ViewEncapsulation.None,
    template: `<deja-tiles id="tiles1" style="height: 500px;width: 400px;display: block;" [(models)]="tiles" canDelete canPaste canCut [designMode]="designMode" maxwidth="100%" tileminwidth="5%" tileminheight="5%" tilemaxheight="50%" tilemaxwidth="50%">
                    <ng-template #tileTemplate let-tile let-pressed="pressed" let-selected="selected">
                        <span style="width: 100%;height: 100%;display: block;" class="tile-content noselect" [style.background-color]="tile.color" [attr.selected]="selected" [attr.pressed]="pressed">{{ tile.templateModel.name }}</span>
                    </ng-template>
                </deja-tiles>
                <deja-tiles id="tiles2" style="height: 500px;width: 400px;display: block;" canPaste canCopy [designMode]="designMode" maxwidth="100%" tileminwidth="5%" tileminheight="5%" tilemaxheight="50%" tilemaxwidth="50%">
                    <ng-template #tileTemplate let-tile let-pressed="pressed" let-selected="selected">
                        <span style="width: 100%;height: 100%;display: block;" class="tile-content noselect" [style.background-color]="tile.color" [attr.selected]="selected" [attr.pressed]="pressed">{{ tile.templateModel.name }}</span>
                    </ng-template>
                </deja-tiles>`,
    styles: [`* { transition: unset !important; }
    deja-tiles {
        left: 100px;
        top: 100px;
    }`]
})
class DejaTilesContainerComponent {
    public fructs = [
        {
            name: 'Peach',
            color: '#FF6F00',
        },
        {
            name: 'Banana',
            color: '#FFEB3B',
        },
        {
            name: 'Cantaloupe',
            color: '#AED581',
        },
        {
            name: 'Cherries',
            color: '#880E4F',
        },
        {
            name: 'ChinesePears',
            color: '#F5F5F5',
        },
        {
            name: 'Cranberries',
            color: '#C2185B',
        },
        {
            name: 'Guava',
            color: '#FFCA28',
        },
        {
            name: 'Grapes',
            color: '#303F9F',
        },
        {
            name: 'Lemon',
            color: '#FFF176',
        },
        {
            name: 'Mango',
            color: '#FBC02D',
        },
        {
            name: 'Pineapple',
            color: '#FDD835',
        },
        {
            name: 'Watermelon',
            color: '#E91E63',
        },
    ] as any[];

    public tiles: DejaTile[];

    public designMode = true;

    constructor() {
        let x = 0;
        let y = 0;

        this.tiles = this.fructs
            .map((fruct) => {
                const tile = new DejaTile(fruct.name);
                tile.percentBounds = new Rect(x, y, 30, 30);
                tile.color = fruct.color;
                tile.templateModel = fruct;

                x += 30;
                if (x + 30 > 100) {
                    x = 0;
                    y += 30;
                }

                return tile;
            });
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: `<deja-tiles style="height: 500px;width: 400px;display: block;" [(models)]="tiles" canDelete canPaste canCut [designMode]="designMode" maxwidth="100%" tileminwidth="5%" tileminheight="5%" tilemaxheight="50%" tilemaxwidth="50%">
                    <ng-template #tileTemplate let-tile let-pressed="pressed" let-selected="selected">
                        <span style="width: 100%;height: 100%;display: block;" class="tile-content noselect" [style.background-color]="tile.color" [attr.selected]="selected" [attr.pressed]="pressed">{{ tile.templateModel.name }}</span>
                    </ng-template>
                </deja-tiles>`,
    styles: [`* { transition: unset !important; }
    deja-tiles {
        left: 100px;
        top: 100px;
    }`]
})
class DejaTileGroupContainerComponent {
    public orange = {
        name: 'Orange',
        color: '#e96c00',
    };

    public tiles: DejaTile[];

    public designMode = false;

    constructor() {
        const group = new DejaTileGroup(this.orange.name);
        group.borderColor = this.orange.color;
        group.borderDirection = DejaTileBorderDirection.bottom;
        group.borderWidth = 4;
        group.html = `<span id="${this.orange.name}">${this.orange.color}</span>`;
        group.percentBounds = new Rect(0, 0, 30, 30);
        group.color = this.orange.color;
        group.templateModel = this.orange;

        this.tiles = [group];
    }
}

describe('DejaTilesComponent', () => {
    let overlayContainerElement: HTMLElement;

    beforeEach(async(() => {
        // Define a ckeditor base path just for tests, because webpack configuration or asset plugin not working
        (<any>window).CKEDITOR_BASEPATH = 'https://dsi-hug.github.io/dejajs-components/assets/ckeditor/';

        TestBed.configureTestingModule({
            declarations: [
                DejaTilesContainerComponent,
                DejaTileGroupContainerComponent
            ],
            imports: [
                BrowserAnimationsModule,
                CommonModule,
                FormsModule,
                DejaTilesModule,
                DejaClipboardModule.forRoot(),
            ],
            providers: [
                { provide: OverlayContainer, useFactory: () => {
                        overlayContainerElement = document.createElement('div');
                        return { getContainerElement: () => overlayContainerElement };
                    }}
            ]
        }).compileComponents();
    }));

    const observeDom$ = (fixture: ComponentFixture<DejaTilesContainerComponent>) => {
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const layoutProvider = tilesDebugElement.injector.get(DejaTilesLayoutProvider) as DejaTilesLayoutProvider;
        return observableFrom(layoutProvider.layoutCompleted);
    };

    const sendMouseEvent = (element: EventTarget, type: string, pageX: number, pageY: number, buttons = 0) => {
        const eventInit = () => ({
            bubbles: true,
            cancelable: (type !== 'mousemove'),
            view: document.defaultView,
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            button: 0,
            buttons: buttons,
            clientX: pageX,
            clientY: pageY,
            relatedTarget: element,
        } as MouseEventInit);
        const event = new MouseEvent(type, eventInit());
        element.dispatchEvent(event);
    };

    it('should create the component', async(() => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        fixture.detectChanges();
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance;
        expect(tilesInstance).toBeTruthy();
    }));

    it('should insert a new tile without bounds at the end', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesContainerInstance = fixture.componentInstance as DejaTilesContainerComponent;
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;

        observeDom$(fixture).pipe(
            first(),
            tap(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                expect(tileElements.length).toBe(13);
                const beerTile = tileElements.find((t) => t.nativeElement.id === 'Beer');
                expect(beerTile).toBeDefined();
                expect(beerTile.nativeElement.offsetTop).toBe(360 + padding);
            }),
            delay(10))
            .subscribe(() => {
                done();
            });

        const tile = new DejaTile('Beer');
        tile.color = '#FBC02D';
        tile.templateModel = {
            name: 'Beer',
            color: '#FBC02D',
        };

        tilesContainerInstance.tiles.unshift(tile);
        tilesContainerInstance.tiles = [...tilesContainerInstance.tiles];
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should select the specified tiles', (done) => {
        let pass = 0;
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;

        observeDom$(fixture)
            .subscribe(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile[selected="true"]'));
                switch (++pass) {
                    case 1:
                        expect(tileElements.length).toBe(0);
                        tilesInstance.selectedTiles = ['Peach', 'Cherries'];
                        tilesInstance.refresh();
                        break;

                    default:
                        done();
                        expect(tileElements.length).toBe(2);
                }
            });

        fixture.detectChanges();
        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should delete the selected tiles', (done) => {
        let pass = 0;
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;

        observeDom$(fixture)
            .subscribe(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                switch (++pass) {
                    case 1:
                        expect(tileElements.length).toBe(12);
                        tilesInstance.deleteSelection();
                        break;

                    default:
                        done();
                        expect(tileElements.length).toBe(10);
                }
            });

        fixture.detectChanges();
        tilesInstance.selectedTiles = ['Guava', 'Mango'];

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should change the cursor when mouse is over a tile', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: HTMLElement, type: string, x: number, y: number, buttons = 0) => {
            const bounds = element.getBoundingClientRect();
            sendMouseEvent(element, type, bounds.left + x, bounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const selectedTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile[selected="true"]'));
                const selectedElement = selectedTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(selectedTile).toBeDefined();

                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                sendMouseEventRelative(selectedElement, 'mousemove', 1, 1);
                return selectedElement;
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('nw-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 60, 1);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('n-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 119, 1);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('ne-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 119, 60);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('e-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 119, 119);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('se-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 60, 119);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('s-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 1, 119);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('sw-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 1, 60);
            }),
            delay(20),
            tap((selectedElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('w-resize');
                sendMouseEventRelative(selectedElement, 'mousemove', 60, 60);
            }),
            delay(20),
            tap(() => {
                expect(tilesContainerElement.style.cursor).toBe('move');
                sendMouseEventRelative(tilesContainerElement, 'mousemove', 1, 1);
            }),
            delay(20))
            .subscribe(() => {
                expect(tilesContainerElement.style.cursor).toBe('');
                done();
            });

        fixture.detectChanges();
        tilesInstance.selectedTiles = ['Cherries'];

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should add and remove tiles', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            tap(() => {
                const tile = new DejaTile('Litchi');
                tile.percentBounds = new Rect(0, 0, 30, 30);
                tile.color = '#C2185B';
                tile.templateModel = {
                    name: 'Litchi',
                    color: '#C2185B',
                };

                tilesInstance.addTiles([tile]);
            }),
            delay(20),
            tap(() => {
                fixture.detectChanges();
                const addedTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Litchi'));
                expect(addedTile).not.toBeNull();
            }),
            delay(10),
            tap(() => tilesInstance.removeTiles(['Cantaloupe', 'Guava'])),
            delay(20),
            tap(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                expect(tileElements.length).toBe(11);
            }),
            delay(10),
            tap(() => {
                // Get free place should return Cantaloupe place
                const rect = tilesInstance.getFreePlace(0, 0, 30, 30);
                expect(rect.left).toBe(60);
                expect(rect.top).toBe(0);
            }))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should add a group', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            tap(() => {
                const tile = new DejaTileGroup();
                tile.html = 'Group1';
                tile.pixelBounds = new Rect(0, 0, 30, 10);
                tilesInstance.addTiles([tile]);
            }),
            delay(20),
            tap(() => {
                fixture.detectChanges();
                const addedGroup = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile > deja-tile-group'));
                expect(addedGroup).not.toBeNull();
            }))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to expand a tile on mouse over when the content is too big', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesContainerInstance = fixture.componentInstance as DejaTilesContainerComponent;
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();

                const expandTileModel = tilesContainerInstance.tiles.find((tile) => tile.id === 'Banana');
                expandTileModel.templateModel.name = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br /> Mauris auctor sit amet odio et aliquet. Curabitur auctor eleifend mattis. <br /> Nullam sit amet quam tellus. Ut mattis tellus sed erat ultricies ornare. <br /> Nulla dictum nisi eu tortor lacinia porttitor. Donec eu arcu et enim cursus viverra. <br /> Praesent pulvinar dui nisi, a tincidunt arcu finibus sed.';

                tilesContainerInstance.designMode = false;
                fixture.detectChanges();

                return expandTileModel;
            }),
            delay(20),
            tap((expandTileModel) => {
                tilesInstance.expandTile(expandTileModel, 200);
            }),
            delay(600),
            tap(() => {
                const sizeElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Banana'));
                const bounds = sizeElement.nativeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();

                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(120 - 2 * padding);
                expect(bounds.height).toBe(200 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 440 + padding);
            }),
            delay(20),
            tap(() => {
                tilesInstance.cancelExpand();
            }),
            delay(600),
            tap(() => {
                const sizeElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Banana'));
                const bounds = sizeElement.nativeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();

                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(120 - 2 * padding);
                expect(bounds.height).toBe(120 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 360 + padding);
            }))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should cut, copy and paste the selected tiles', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tiles1DebugElement = fixture.debugElement.query(By.css('deja-tiles#tiles1'));
        const tiles1Instance = tiles1DebugElement.componentInstance as DejaTilesComponent;
        const tiles2DebugElement = fixture.debugElement.query(By.css('deja-tiles#tiles2'));
        const tiles2Instance = tiles2DebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendKeyUp = (element: EventTarget, code: string, ctrlKey: boolean) => {
            const event = new KeyboardEvent('keyup', {
                code: `Key${code.toUpperCase()}`,
                key: code,
                ctrlKey: ctrlKey,
            } as KeyboardEventInit);
            element.dispatchEvent(event);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            first(),
            delay(1),
            tap(() => sendKeyUp(tilesContainerElement.ownerDocument, 'X', true)),
            delay(1),
            tap(() => {
                const cuttedElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile[cutted="true"]'));
                expect(cuttedElements.length).toBe(0);
                const elements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles2 > #tiles > deja-tile'));
                expect(elements.length).toBe(0);
                tiles1Instance.onFocus();
            }),
            delay(1),
            tap(() => sendKeyUp(tilesContainerElement.ownerDocument, 'X', true)),
            delay(1),
            tap(() => {
                const cuttedElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile[cutted="true"]'));
                expect(cuttedElements.length).toBe(2);
                tiles1Instance.onBlur();
                tiles2Instance.onFocus();
            }),
            delay(1),
            tap(() => sendKeyUp(tilesContainerElement.ownerDocument, 'V', true)),
            delay(20),
            tap(() => {
                const cuttedElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile[cutted="true"]'));
                expect(cuttedElements.length).toBe(0);
                tiles2Instance.refresh();
            }),
            delay(1),
            tap(() => {
                const elements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles2 > #tiles > deja-tile'));
                expect(elements.length).toBe(2);
                tiles2Instance.selectedTiles = tiles2Instance.tiles.map((tile) => tile.id);
            }),
            delay(1),
            tap(() => sendKeyUp(tilesContainerElement.ownerDocument, 'C', true)),
            delay(1),
            tap(() => {
                tiles2Instance.onBlur();
                tiles1Instance.onFocus();
            }),
            delay(1),
            tap(() => sendKeyUp(tilesContainerElement.ownerDocument, 'V', true)),
            delay(20),
            tap(() => {
                tiles1Instance.refresh();
                tiles2Instance.refresh();
            }),
            delay(1))
            .subscribe(() => {
                const elements1 = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                expect(elements1.length).toBe(12);
                const elements2 = fixture.debugElement.queryAll(By.css('deja-tiles#tiles2 > #tiles > deja-tile'));
                expect(elements2.length).toBe(2);
                done();
            });

        fixture.detectChanges();
        tiles1Instance.selectedTiles = ['Guava', 'Mango'];

        fixture.whenStable().then(() => {
            tiles1Instance.refresh();
            tiles1Instance.onBlur();
        });
    });

    it('should invert two tiles when a tile is drag and dropped into another', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const dragTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Peach'));

                const dragElement = dragTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(dragElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                sendMouseEventRelative(dragElement, 'mousemove', 60, 60);
                fixture.detectChanges();
                return dragElement;
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('move');
                sendMouseEventRelative(dragElement, 'mousedown', 60, 60, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 70, 70, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Drag on another tile
                sendMouseEventRelative(dragElement, 'mousemove', 190, 190, 1);
            }),
            delay(600),
            tap((dragElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(dragElement.ownerDocument, 'mouseup', 190, 190, 0);
            }),
            delay(10),
            tap((dragElement: HTMLElement) => {
                const bounds = dragElement.getBoundingClientRect();
                const invertedElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#ChinesePears'));
                const invertedBounds = invertedElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();

                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + 120 + padding);
                expect(invertedBounds.left).toBe(tilesContainerBounds.left + padding);
                expect(invertedBounds.top).toBe(tilesContainerBounds.top + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the right border', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Peach'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 119, 60);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('e-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 119, 60, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 129, 60, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 240, 60, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 240, 60, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(200 - 2 * padding);
                expect(bounds.height).toBe(120 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 480 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the left border', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Cantaloupe'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 241, 60);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('w-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 241, 60, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 231, 60, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 0, 60, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 0, 60, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 160 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(200 - 2 * padding);
                expect(bounds.height).toBe(120 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 480 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the bottom border', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Banana'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 180, 119);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('s-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 180, 119, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 180, 129, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 180, 150, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 180, 150, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(120 - 2 * padding);
                expect(bounds.height).toBe(141 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 380 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the top border', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Grapes'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 180, 241);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('n-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 180, 241, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 180, 231, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 180, 200, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 180, 200, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + 209 + padding);
                expect(bounds.width).toBe(120 - 2 * padding);
                expect(bounds.height).toBe(151 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 400 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the bottom right corner', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Peach'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 119, 119);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('se-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 119, 119, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 129, 129, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 240, 240, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 240, 240, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + padding);
                expect(bounds.width).toBe(200 - 2 * padding);
                expect(bounds.height).toBe(200 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 560 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the top right corner', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Grapes'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 239, 241);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('ne-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 239, 241, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 249, 231, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 300, 200, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 300, 200, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Pineapple'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + 209 + padding);
                expect(bounds.width).toBe(171 - 2 * padding);
                expect(bounds.height).toBe(151 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 120 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 520 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the top left corner', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Lemon'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 241, 241);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('nw-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 241, 241, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 231, 231, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 200, 200, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 200, 200, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Watermelon'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 209 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + 209 + padding);
                expect(bounds.width).toBe(151 - 2 * padding);
                expect(bounds.height).toBe(151 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 240 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 400 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should be able to size a tile with the mouse from the bottom left corner', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));
                const sizeTile = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Lemon'));

                const sizeElement = sizeTile.nativeElement as HTMLElement;

                expect(tileElements.length).toBe(12);
                expect(sizeElement).toBeDefined();
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);

                return sizeElement;
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                sendMouseEventRelative(sizeElement, 'mousemove', 241, 359);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                expect(tilesContainerElement.style.cursor).toBe('sw-resize');
                // Start size
                sendMouseEventRelative(sizeElement, 'mousedown', 241, 359, 1);
            }),
            delay(20),
            tap((dragElement: HTMLElement) => {
                // Start drag
                sendMouseEventRelative(dragElement, 'mousemove', 231, 369, 1);
            }),
            delay(20),
            tap((sizeElement: HTMLElement) => {
                // Size on left
                sendMouseEventRelative(sizeElement, 'mousemove', 200, 400, 1);
            }),
            delay(600),
            tap((sizeElement: HTMLElement) => {
                // Drop
                sendMouseEventRelative(sizeElement.ownerDocument, 'mouseup', 200, 400, 0);
            }),
            tap((sizeElement: HTMLElement) => {
                const bounds = sizeElement.getBoundingClientRect();
                const testElement = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles > deja-tile#Watermelon'));
                const testBounds = testElement.nativeElement.getBoundingClientRect();
                const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
                expect(bounds.left).toBe(tilesContainerBounds.left + 209 + padding);
                expect(bounds.top).toBe(tilesContainerBounds.top + 240 + padding);
                expect(bounds.width).toBe(151 - 2 * padding);
                expect(bounds.height).toBe(151 - 2 * padding);
                expect(testBounds.left).toBe(tilesContainerBounds.left + 240 + padding);
                expect(testBounds.top).toBe(tilesContainerBounds.top + 400 + padding);
            }),
            delay(20))
            .subscribe(() => {
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should select by drag and drop with the mouse', (done) => {
        const fixture = TestBed.createComponent(DejaTilesContainerComponent);
        const tilesDebugElement = fixture.debugElement.query(By.directive(DejaTilesComponent));
        const tilesInstance = tilesDebugElement.componentInstance as DejaTilesComponent;
        const tilesContainer = fixture.debugElement.query(By.css('deja-tiles#tiles1 > #tiles'));
        const tilesContainerElement = tilesContainer.nativeElement as HTMLElement;

        const sendMouseEventRelative = (element: EventTarget, type: string, x: number, y: number, buttons = 0) => {
            const tilesContainerBounds = tilesContainerElement.getBoundingClientRect();
            sendMouseEvent(element, type, tilesContainerBounds.left + x, tilesContainerBounds.top + y, buttons);
            fixture.detectChanges();
        };

        observeDom$(fixture).pipe(
            debounceTime(10),
            first(),
            map(() => {
                fixture.detectChanges();
                const tileElements = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile'));

                expect(tileElements.length).toBe(12);
                sendMouseEventRelative(tilesContainerElement, 'mouseenter', 0, 0);
            }),
            delay(20),
            tap(() => {
                sendMouseEventRelative(tilesContainerElement, 'mousemove', 365, 20);
            }),
            delay(20),
            tap(() => {
                expect(tilesContainerElement.style.cursor).toBe('');
                // Start selection
                sendMouseEventRelative(tilesContainerElement, 'mousedown', 365, 20, 1);
            }),
            delay(20),
            tap(() => {
                // Select
                sendMouseEventRelative(tilesContainerElement, 'mousemove', 20, 230, 1);
            }),
            delay(20),
            tap(() => {
                // Drop
                sendMouseEventRelative(tilesContainerElement.ownerDocument, 'mouseup', 20, 230, 0);
            }))
            .subscribe(() => {
                const selectedTiles = fixture.debugElement.queryAll(By.css('deja-tiles#tiles1 > #tiles > deja-tile[selected="true"]'));
                expect(selectedTiles.length).toBe(6);
                done();
            });

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            tilesInstance.refresh();
        });
    });

    it('should a group tile switch from edition or not', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        const groupContainerCmp = fixture.componentRef.instance;
        fixture.detectChanges();

        const tileGroupDebugElement = fixture.debugElement.query(By.css('deja-tiles deja-tile-group'));
        expect(tileGroupDebugElement).toBeDefined();

        const tileGroupCmp: DejaTileGroupComponent = tileGroupDebugElement.componentInstance;
        expect(tileGroupDebugElement.query(By.css('deja-editor'))).toBeFalsy('Editor should not be defined');

        groupContainerCmp.designMode = true;
        fixture.detectChanges();
        expect(tileGroupDebugElement.query(By.css('deja-editor'))).toBeFalsy('Editor should not be defined');

        tileGroupCmp.edit();
        fixture.detectChanges();
        expect(tileGroupDebugElement.query(By.css('deja-editor'))).toBeDefined('Editor should be defined when editing');

        tileGroupCmp.onEditorBlur();
        fixture.detectChanges();
        expect(tileGroupDebugElement.query(By.css('deja-editor'))).toBeFalsy('Editor should not be defined');
    }));

    it('should update group tile model', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        fixture.detectChanges();

        const tileGroupDebugElement = fixture.debugElement.query(By.css('deja-tiles deja-tile-group'));
        expect(tileGroupDebugElement).toBeDefined();

        const tileGroupCmp: any = tileGroupDebugElement.componentInstance;
        // tslint:disable-next-line:no-bitwise
        tileGroupCmp._model.borderDirection = DejaTileBorderDirection.top | DejaTileBorderDirection.left | DejaTileBorderDirection.right;
        tileGroupCmp._model.borderWidth = 10;
        tileGroupCmp._model.borderColor = '#fff';

        tileGroupCmp.updateModel();
        expect(tileGroupCmp.borderTop).toBe('solid #fff 10px', 'borderTop shoud be solid #fff 10px');
        expect(tileGroupCmp.borderRight).toBe('solid #fff 10px', 'borderRight shoud be solid #fff 10px');
        expect(tileGroupCmp.borderLeft).toBe('solid #fff 10px', 'borderLeft shoud be solid #fff 10px');
        expect(tileGroupCmp.borderBottom).toBeNull();

        tileGroupCmp._model = null;
        tileGroupCmp.updateModel();
        expect(tileGroupCmp.borderTop).toBeNull();
        expect(tileGroupCmp.borderRight).toBeNull();
        expect(tileGroupCmp.borderLeft).toBeNull();
        expect(tileGroupCmp.borderBottom).toBeNull();
    }));

    it('should open  TileGroupStyleEditorComponent on edit', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        fixture.detectChanges();

        const tileGroupCmp: DejaTileGroupComponent = fixture.debugElement.query(By.css('deja-tiles deja-tile-group')).componentInstance;
        tileGroupCmp.editStyle();
        fixture.detectChanges();

        expect(overlayContainerElement).toBeTruthy('overlayContainerElement');
        fixture.whenStable().then(() => expect(overlayContainerElement.querySelector('deja-tile-group-style-editor')).toBeTruthy('Popup TileGroupStyleEditorComponent should be displayed'));
    }));

    it('should restore previous border values on popup response not accepted', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        const dejaTileGroupContainerComponent = fixture.componentInstance;
        fixture.detectChanges();

        const tileGroupCmp: DejaTileGroupComponent = fixture.debugElement.query(By.css('deja-tiles deja-tile-group')).componentInstance;
        tileGroupCmp.editStyle();
        fixture.detectChanges();

        const responseSubject = new BehaviorSubject(null);
        spyOn((tileGroupCmp as any).dejaPopupService, 'openAdvanced$').and.returnValue(responseSubject.pipe(filter(res => !!res)));
        tileGroupCmp.editStyle();
        tileGroupCmp.model.borderColor = '#fff';
        tileGroupCmp.model.borderDirection = DejaTileBorderDirection.left;
        tileGroupCmp.model.borderWidth = 10;
        responseSubject.next({accepted: false});
        expect(tileGroupCmp.model.borderColor).toBe(dejaTileGroupContainerComponent.orange.color);
        expect(tileGroupCmp.model.borderDirection).toBe(4); // Should be DejaTileBorderDirection.bottom, but karma doesn't understand
        expect(tileGroupCmp.model.borderWidth).toBe(4);
    }));

    it('should clear border if no borderDirection or no borderwidth are selected', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        fixture.detectChanges();

        const tileGroupCmp: DejaTileGroupComponent = fixture.debugElement.query(By.css('deja-tiles deja-tile-group')).componentInstance;
        tileGroupCmp.editStyle();
        fixture.detectChanges();

        const responseSubject = new BehaviorSubject(null);
        spyOn((tileGroupCmp as any).dejaPopupService, 'openAdvanced$').and.returnValue(responseSubject.pipe(filter(res => !!res)));
        tileGroupCmp.editStyle();
        tileGroupCmp.model.borderColor = '#fff';
        tileGroupCmp.model.borderDirection = DejaTileBorderDirection.left;
        tileGroupCmp.model.borderWidth = 0;
        responseSubject.next({accepted: true});
        expect(tileGroupCmp.model.borderDirection).toBe(DejaTileBorderDirection.top + DejaTileBorderDirection.right + DejaTileBorderDirection.bottom + DejaTileBorderDirection.left);
        expect(tileGroupCmp.model.borderWidth).toBe(0);
        expect(tileGroupCmp.model.borderColor).toBe('#000');
    }));

    it('should keep new border values on popup response accepted', async(() => {
        const fixture = TestBed.createComponent(DejaTileGroupContainerComponent);
        fixture.detectChanges();

        const tileGroupCmp: DejaTileGroupComponent = fixture.debugElement.query(By.css('deja-tiles deja-tile-group')).componentInstance;
        tileGroupCmp.editStyle();
        fixture.detectChanges();

        const responseSubject = new BehaviorSubject(null);
        spyOn((tileGroupCmp as any).dejaPopupService, 'openAdvanced$').and.returnValue(responseSubject.pipe(filter(res => !!res)));
        tileGroupCmp.editStyle();
        tileGroupCmp.model.borderColor = '#fff';
        tileGroupCmp.model.borderDirection = DejaTileBorderDirection.left;
        tileGroupCmp.model.borderWidth = 10;
        responseSubject.next({accepted: true});
        expect(tileGroupCmp.model.borderColor).toBe('#fff');
        expect(tileGroupCmp.model.borderDirection).toBe(DejaTileBorderDirection.left);
        expect(tileGroupCmp.model.borderWidth).toBe(10);
    }));
});
