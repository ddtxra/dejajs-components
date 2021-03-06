/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DejaChipsModule } from '@deja-js/component/chips';
import { KeyCodes } from '@deja-js/core';
import { DejaTagComponent } from './tag.component';

describe('DejaTagComponent', () => {

    let comp: DejaTagComponent;
    let fixture: ComponentFixture<DejaTagComponent>;

    const getNbItems = (): number => {
        const items = fixture.debugElement.queryAll(By.css('deja-chips > span'));
        return items.length;
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DejaTagComponent
            ],
            imports: [
                CommonModule,
                FormsModule,
                MatIconModule,
                MatInputModule,
                DejaChipsModule,
                BrowserAnimationsModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DejaTagComponent);
        comp = fixture.componentInstance; // Component test instance
    }));

    it('should create the component', async(() => {
        expect(comp).toBeTruthy();
    }));

    it('should init with items', () => {
        comp.value = ['Angular', 'HTML5'];
        fixture.detectChanges();
        expect(getNbItems()).toEqual(2);
    });

    it('should add items', () => {
        expect(getNbItems()).toEqual(0);

        comp.onAddItem('CSS3');
        fixture.detectChanges();
        expect(getNbItems()).toEqual(1);

        comp.onAddItem('JSF');
        fixture.detectChanges();
        expect(getNbItems()).toEqual(2);
    });

    it('should not add null item', () => {
        expect(getNbItems()).toEqual(0);

        comp.onAddItem(null);
        fixture.detectChanges();
        expect(getNbItems()).toEqual(0);
    });

    it('should not add empty item', () => {
        expect(getNbItems()).toEqual(0);

        comp.onAddItem('');
        fixture.detectChanges();
        expect(getNbItems()).toEqual(0);
    });

    it('should add item on keypress Enter', () => {
        expect(getNbItems()).toEqual(0);
        const tmp = { keyCode: KeyCodes.Enter, target: { value: 'HTML5' } } as any;

        comp.onKeyDown(tmp);
        fixture.detectChanges();
        expect(getNbItems()).toEqual(1);
    });

    it('should not add item on keypress Ctrl', () => {
        expect(getNbItems()).toEqual(0);
        const tmp = { keyCode: KeyCodes.Ctrl, target: { value: 'HTML5' } } as any;

        comp.onKeyDown(tmp);
        fixture.detectChanges();
        expect(getNbItems()).toEqual(0);
    });
});
