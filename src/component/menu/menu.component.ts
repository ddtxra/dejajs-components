/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { ConnectedOverlayDirective, OverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { DejaConnectionPositionPair } from '../../common/core/overlay/connection-position-pair';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'deja-menu',
    styleUrls: [
        './menu.component.scss',
    ],
    templateUrl: './menu.component.html',
})
export class DejaMenuComponent implements OnInit, OnDestroy {
    /** Renvoie une valeur qui indique si le menu est affiché. */
    @Input() public isVisible = false;
    /** Renvoie ou définit l'élement sur lequel le menu devra s'aligner */
    @Input() public ownerElement: HTMLElement;

    /** Déclenché lorsque la visibilité du menu change. */
    @Output() public visibleChange = new EventEmitter<boolean>();

    /** Internal use */
    public overlayOrigin: OverlayOrigin;
    public overlayOffsetX = 0;
    public overlayOffsetY = 0;

    private contentInitialized$ = new Subject();
    private isMobile = false;
    private isAlive = true;

    private _positions = DejaConnectionPositionPair.default;

    /** Overlay pane containing the options. */
    @ViewChild(ConnectedOverlayDirective) private overlay: ConnectedOverlayDirective;

    @Input()
    public set positions(value: DejaConnectionPositionPair[] | string) {
        this._positions = typeof value === 'string' ? DejaConnectionPositionPair.parse(value) : value;
    }

    public get positions() {
        return !this.isMobile ? this._positions : DejaConnectionPositionPair.parse('start top start top');
    }

    public get width() {
        return !this.isMobile ? null : '100%';
    }

    constructor(private changeDetectorRef: ChangeDetectorRef, private elementRef: ElementRef, media: ObservableMedia) {
        Observable.merge(this.contentInitialized$, media.asObservable())
            .takeWhile(() => this.isAlive)
            .subscribe(() => {
                this.isMobile = media.isActive('xs') || media.isActive('sm');
                this.changeDetectorRef.markForCheck();
            });
    }

    public ngOnDestroy() {
        this.isAlive = false;
    }

    public ngOnInit() {
        this.contentInitialized$.next();
    }

    /** Affiche le menu. */
    public show(event: MouseEvent | number, offsetY?: number) {
        this.overlayOffsetX = offsetY !== undefined ? +event : 0;
        this.overlayOffsetY = offsetY || 0;
        const e = event as MouseEvent;
        const target = e && e.target;
        this.overlayOrigin = new OverlayOrigin(new ElementRef((this.isMobile && document.body) || target || this.elementRef.nativeElement));
        this.isVisible = true;
        this.visibleChange.emit(this.isVisible);
        this.changeDetectorRef.markForCheck();
        Observable.timer(1)
            .first()
            .subscribe(() => {
                this.overlay.overlayRef.updatePosition();
            });
    }

    /** Ferme le menu. */
    public close() {
        this.isVisible = false;
        this.visibleChange.emit(this.isVisible);
        this.changeDetectorRef.markForCheck();
    }
}
