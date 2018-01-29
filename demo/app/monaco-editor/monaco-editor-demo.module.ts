import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Routes } from '@angular/router';
import { DejaMarkdownModule } from '../../../src/component/markdown/index';
import { DejaMonacoEditorModule } from '../../../src/component/monaco-editor/index';
import { DejaSplitterModule } from '../../../src/component/splitter/index';
import { DejaMonacoEditorDemoComponent } from './monaco-editor-demo.component';
import { MonacoEditorDemoService } from './monaco-editor-demo.service.';

const routes: Routes = [
    { path: '', component: DejaMonacoEditorDemoComponent },
];

@NgModule({
    imports: [
        DejaMonacoEditorModule,
        CommonModule,
        FormsModule,
        MatCardModule,
        MatCheckboxModule,
        MatSelectModule,
        MatTabsModule,
        MatToolbarModule,
        DejaSplitterModule,
        DejaMarkdownModule,
        RouterModule.forChild(routes),
    ],
    declarations: [DejaMonacoEditorDemoComponent],
    providers: [
        MonacoEditorDemoService
    ],
})
export class MonacoEditorDemoModule { }
