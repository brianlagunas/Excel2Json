import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { IgxExcelModule } from 'igniteui-angular-excel';
import { IgxSpreadsheetModule } from 'igniteui-angular-spreadsheet';

import {
  IgxAvatarModule,
  IgxDialogModule,
  IgxDropDownModule,
  IgxIconModule,
  IgxInputGroupModule,
  IgxToggleModule
} from 'igniteui-angular';
import { NavbarModule } from '../navbar/navbar.module';
import { CodeEditorModule } from '../code-editor/code-editor.module';

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
    NavbarModule,
    CodeEditorModule,
  ]
})
export class EditorModule { }
