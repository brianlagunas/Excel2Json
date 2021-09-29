import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { IgxExcelModule } from 'igniteui-angular-excel';
import { HelpModule } from '../help-menu/help-menu.component';
import { IgxSpreadsheetModule } from 'igniteui-angular-spreadsheet';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import {
  IgxAvatarModule,
  IgxDialogModule,
  IgxDropDownModule,
  IgxIconModule,
  IgxInputGroupModule,
  IgxToggleModule
} from 'igniteui-angular';


@NgModule({
  declarations: [
    EditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EditorRoutingModule,
    IgxIconModule,
    IgxAvatarModule,
    IgxDialogModule,
    IgxToggleModule,
    IgxInputGroupModule,
    IgxExcelModule,
    IgxSpreadsheetModule,
    MonacoEditorModule.forRoot(),
    HelpModule
  ]
})
export class EditorModule { }
