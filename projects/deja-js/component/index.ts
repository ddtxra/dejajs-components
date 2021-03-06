/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

export * from './chips/index';
export * from './circular-picker/index';
export * from './color-picker/index';
export * from './color-selector/index';
export * from './content-editable/index';
export * from './data-grid/index';
export * from './date-picker/index';
export * from './date-selector/index';
export * from './dialog/index';
export * from './dragdrop/index';
export * from './editor/index';
export * from './loaders/index';
export * from './message-box/index';
export * from './monaco-editor/index';
export * from './mouse-dragdrop/index';
export * from './numeric-stepper/index';
export * from './overlay/index';
export * from './popup/index';
export * from './range/index';
export * from './select/index';
export * from './sidenav/index';
export * from './snackbar/index';
export * from './splitter/index';
export * from './tag/index';
export * from './templates/index';
export * from './tiles/index';
export * from './tooltip/index';
export * from './tree-list/index';
export * from './viewport/index';

if (!document.doctype) {
    console.warn('[DejaJS] Current document does not have a doctype. This may cause some components not to behave as expected.');
}
