/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { from as observableFrom, Subject, Subscription, timer as observableTimer } from 'rxjs';
import { debounce, delay, first, tap } from 'rxjs/operators';

interface IAnimation {
    before: CSSStyleDeclaration;
    after: CSSStyleDeclaration;
    delay?: number;
    duration: number;
    easing: string;
}

@Component({
    selector: 'deja-snackbar',
    styleUrls: ['./snackbar.component.scss'],
    template: `<ng-content></ng-content>`,

})
export class DejaSnackbarComponent implements OnInit, AfterViewInit, OnDestroy {

    /**
     * all snackbar instances
     */
    private static instances: DejaSnackbarComponent[] = [];

    /**
     * inner container
     */
    // @ViewChild('container') public host;

    /**
     * specify delay for the enter animation
     */
    @Input() public delay = 0;

    /**
     * specify lifetime of the snackbar on the screen
     */
    @Input() public duration = 0;

    /**
     * set a container for the snackbar instead of default behavior (viewport)
     */
    @Input() public outerContainerElement: HTMLElement;

    /**
     * callback used to negate the boolean responsible for the presence of the snackbar on the dom (see demo)
     */
    @Output() public onAnimationDone: EventEmitter<any> = new EventEmitter();

    /**
     * inner container element, represent the snackbar since the host has no height width and a position relative to it's html declaration
     */
    private host: HTMLElement;

    /**
     * height of the inner container element
     */
    private height: number;

    /**
     * vertical space between snackbar
     */
    private marginTop = 6;

    /**
     * snackbar creation timestamp, used for calculation, forthe adapt animation
     */
    private timestamp: number = +new Date();

    /**
     * enter animation duration
     */
    private enterAnimationDuration = 350;

    /**
     * leave animation duration
     */
    private leaveAnimationDuration = 175;

    /**
     * adapt animation duration
     */
    private adaptAnimationDuration = 225;

    /**
     * string representation of the alignment, used for statements and initial final position
     */
    private anchor: string;

    /**
     * object representation of the alignment, used to filter incompatible alignments and build the string representation
     */
    private alignents: {
        [prop: string]: boolean;
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    };

    private animate$ = new Subject<IAnimation>();
    private animate$sub: Subscription;

    /**
     * alignents setter
     */
    @Input() public set alignment(value: string) {
        this.alignents = {
            bottom: false,
            left: false,
            right: false,
            top: false,
        };

        // set alignents
        if (value) {
            value
                .split(/\s+/g)
                .map((align: string) => this.alignents[align] = true);
        }

        // filter incompatible alignments
        this.alignents.bottom = this.alignents.top && this.alignents.bottom ? false : this.alignents.bottom;
        this.alignents.left = this.alignents.right && this.alignents.left ? false : this.alignents.left;
    }

    /**
     * Creates an instance of DejaSnackbarComponent.
     *
     * @param elementRef
     * @param renderer
     */
    constructor(private elementRef: ElementRef) {
        if (!DejaSnackbarComponent.instances) {
            DejaSnackbarComponent.instances = [];
        }
        DejaSnackbarComponent.instances.push(this);

        const applyParams = (styles: CSSStyleDeclaration) => {
            Object.keys(styles)
                .forEach((key) => {
                    (<any>this.host.style)[key] = (<any>styles)[key];
                });
        };

        this.animate$sub = observableFrom(this.animate$).pipe(
            tap((animation) => applyParams(animation.before)),
            delay(1),
            tap((animation) => {
                this.host.style.transitionDuration = `${animation.duration}ms`;
                this.host.style.transitionTimingFunction = animation.easing;
                this.host.style.transitionProperty = Object.keys(animation.before).join(',');
            }),
            debounce((animation) => observableTimer(animation.delay || 1)),
            tap((animation) => applyParams(animation.after)),
            debounce((animation) => observableTimer(animation.duration)))
            .subscribe(() => {
                this.host.style.transitionDuration = '';
                this.host.style.transitionTimingFunction = '';
                this.host.style.transitionProperty = '';
            });
    }

    /**
     * used to recalculate the position of the snackbar on the X axis when resizing / changing from landscape to portrait and vice versa
     *
     * @param event
     */
    @HostListener('window:resize', []) public onResize() {
        this.setNewWidth();
    }

    /**
     * onInit hook
     */
    public ngOnInit(): void {
        // Choose animation depending on alignment
        const anchors = [] as string[];

        Object.keys(this.alignents).forEach((key) => {
            if (this.alignents[key]) {
                anchors.push(key);
            }
        });

        anchors.sort((x, y) => x > y ? 1 : -1);
        const anchor = anchors.reduce((acc, curr) => {
            if (acc === '') {
                acc += curr;
            } else {
                acc += `-${curr}`;
            }
            return acc;
        }, '');

        this.anchor = anchor;
    }

    /**
     * afterviewInit hook
     */
    public ngAfterViewInit(): void {
        this.host = this.elementRef.nativeElement as HTMLElement;

        if (!this.outerContainerElement) {
            // Set default outer container if none specified
            this.outerContainerElement = this.host.ownerDocument.body as HTMLElement;
        } else {
            // Otherwise, set inner container position to absolute for correct placement of snackbars
            this.host.classList.add('absolute');
        }

        this.height = this.host.getBoundingClientRect().height;
        this.setPosition();
        this.launchEnterAnimation();

        // if a duration has been been specified, launch the 'leave' animation after snackbar's lifetime flow, then emit amination done
        observableTimer(this.duration + this.delay).pipe(
            first(),
            tap(() => {
                if (!!this.duration) {
                    this.launchLeaveAnimation();
                }
            }),
            delay(this.leaveAnimationDuration))
            .subscribe(() => this.onAnimationDone.emit());
    }

    /**
     * onDestroy hook
     */
    public ngOnDestroy(): void {
        // check if snackbars have to move (if they were created after the one deleted)
        if (!!DejaSnackbarComponent.instances.length) {
            DejaSnackbarComponent.instances
                .filter((instance: DejaSnackbarComponent) => this.outerContainerElement === instance.outerContainerElement)
                .filter((instance: DejaSnackbarComponent) => this.anchor === instance.anchor)
                .forEach((instance) => {
                    if (instance.timestamp > this.timestamp) {
                        instance.launchAdaptAnimation(this.height);
                    }
                });
        }
        // remove the soon to be destroyed snackbar from the instances array
        DejaSnackbarComponent.instances = DejaSnackbarComponent.instances
            .filter((instance: DejaSnackbarComponent) => this !== instance);

        this.animate$sub.unsubscribe();
    }

    /**
     * emit animation done
     *
     * @param event
     */
    protected animationDone(event: Event): void {
        this.onAnimationDone.emit(event);
    }

    protected increaseElevation() {
        const zIndex = window.getComputedStyle(this.host).zIndex;
        this.host.style.zIndex = (+zIndex + 1).toString();
    }

    protected decreaseElevation() {
        const zIndex = window.getComputedStyle(this.host).zIndex;
        this.host.style.zIndex = (+zIndex - 1).toString();
    }

    /**
     * compute cumulated height of all snackbars, precedent instance height, width and height of the innerContainer
     *
     * @return cumulated height of all snackbars, precedent instance height, width and height of the innerContainer
     */
    private computePosition(): any {
        // Inner container
        const innerContainerElementBounds = this.host.getBoundingClientRect();
        const innerContainerWidth = innerContainerElementBounds.width;
        const innerContainerHeight = innerContainerElementBounds.height;

        // Instances sharing the same outer container and the same anchor
        const instancesInSameZone = DejaSnackbarComponent.instances
            .filter((instance: DejaSnackbarComponent) => this.outerContainerElement === instance.outerContainerElement)
            .filter((instance: DejaSnackbarComponent) => this.anchor === instance.anchor)
            .filter((instance: DejaSnackbarComponent) => this !== instance);

        let precedentInstanceHeight = 0;

        if (!!instancesInSameZone) {
            const precedentInstance = instancesInSameZone[instancesInSameZone.length - 1];

            if (!!precedentInstance) {
                const innerContainerElement = precedentInstance.elementRef.nativeElement as HTMLElement;
                precedentInstanceHeight = innerContainerElement.getBoundingClientRect().height;
            }
        }

        // computed height of inner containers, sharing the same outer container and the same anchor
        const computedHeight = instancesInSameZone
            .map((instance: DejaSnackbarComponent) => {
                const innerContainerElement = instance.elementRef.nativeElement as HTMLElement;
                return innerContainerElement.getBoundingClientRect().height;
            })
            .reduce((acc, curr) => {
                acc += curr + this.marginTop;
                return acc;
            }, 0);

        return {
            innerContainerWidth,
            innerContainerHeight,
            precedentInstanceHeight,
            computedHeight,
        };
    }

    /**
     * set the final position of the snackbar
     */
    private setPosition(): void {

        const { innerContainerWidth, innerContainerHeight, computedHeight } = this.computePosition();

        if (this.anchor === 'left') {
            this.host.style.left = `${2}%`;
            this.host.style.bottom = `calc(${33}% + ${computedHeight}px)`;
        }
        if (this.anchor === 'right') {
            this.host.style.left = `calc(${98}% - ${innerContainerWidth}px)`;
            this.host.style.bottom = `calc(${33}% + ${computedHeight}px)`;
        }
        if (this.anchor === 'top') {
            this.host.style.left = `calc(${50}% - ${innerContainerWidth / 2}px )`;
            this.host.style.bottom = `calc(${92}% - ${innerContainerHeight}px)`;
        }
        if (this.anchor === 'bottom') {
            this.host.style.left = `calc(${50}% - ${innerContainerWidth / 2}px )`;
            this.host.style.bottom = `calc(${2}% + ${computedHeight}px)`;
        }

        if (this.anchor === 'bottom-left') {
            this.host.style.left = `${2}%`;
            this.host.style.bottom = `calc(${2}% + ${computedHeight}px)`;
        }
        if (this.anchor === 'bottom-right') {
            this.host.style.left = `calc(${98}% - ${innerContainerWidth}px)`;
            this.host.style.bottom = `calc(${2}% + ${computedHeight}px)`;
        }
        if (this.anchor === 'left-top') {
            this.host.style.left = `${2}%`;
            this.host.style.bottom = `calc(${92}% - ${innerContainerHeight}px - ${computedHeight}px)`;
        }
        if (this.anchor === 'right-top') {
            this.host.style.left = `calc(${98}% - ${innerContainerWidth}px)`;
            this.host.style.bottom = `calc(${92}% - ${innerContainerHeight}px - ${computedHeight}px)`;
        }

    }

    /**
     * recalculate X position for the snackbar (see @HostListener)
     */
    private setNewWidth(): void {
        const { innerContainerWidth } = this.computePosition();

        if (this.anchor === 'top' || this.anchor === 'bottom') {
            this.elementRef.nativeElement.style.left = `calc(${50}% - ${innerContainerWidth / 2}px )`;
        }
    }

    /**
     * launch adapt animation (snackbar disposal trigger this method)
     * important note:
     * matrix retrieval is used instead of translate Y because using translateY in enter and adapt animation seems
     * to cause unexpected behavior (understand bug)
     * there is also a known bug, if you close a snackbar which share anchor and container with an other one created at the same moment
     * adaptation of the position will not be performed correctly, see demo for more information about how to avoid this behavior
     *
     * @param height
     */
    private launchAdaptAnimation(height: number) {

        let direction = 1;
        if (this.alignents.top) {
            direction = -1;
        }

        const transform = window.getComputedStyle(this.host).transform;
        const sixth = parseFloat(transform
            .split(',')
            .slice(-1)
            .pop());

        this.animate$.next({
            before: {
                transform: `${transform}`,
            },
            after: {
                transform: `matrix(1,0,0,1,0,${sixth + ((height + this.marginTop) * direction)})`,
            },
            duration: this.adaptAnimationDuration,
            easing: 'ease',
        } as IAnimation);
    }

    /**
     * launch enter animation (snackbar instanciation trigger this method)
     */
    private launchEnterAnimation() {
        let direction = -1;
        if (this.alignents.top) {
            direction = 1;
        }

        this.animate$.next({
            before: {
                opacity: '0',
                transform: `translateY(${direction * 200}%)`,
            },
            after: {
                opacity: '1',
                transform: `translateY(0)`,
            },
            delay: this.delay,
            duration: this.enterAnimationDuration,
            easing: 'ease',
        } as IAnimation);
    }

    /**
     * launch leave animation (snackbar lifetime flow trigger this animation)
     */
    private launchLeaveAnimation() {
        this.animate$.next({
            before: {
                opacity: '1',
            },
            after: {
                opacity: '0',
            },
            duration: this.leaveAnimationDuration,
            easing: 'ease',
        } as IAnimation);
    }
}
