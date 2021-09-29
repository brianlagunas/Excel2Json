import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadComponent } from './upload/upload.component';
import { IgxButtonModule, IgxDialogModule, IgxIconModule, IgxToggleModule, IgxAvatarModule, IgxInputGroupModule,
         IgxDropDownModule, IgxSelectModule, IgxRippleModule } from 'igniteui-angular';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './editor/editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { IgxExcelModule } from 'igniteui-angular-excel';
import { IgxSpreadsheetModule } from 'igniteui-angular-spreadsheet';
import { HelpMenuComponent } from './help-menu/help-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    EditorComponent,
    HelpMenuComponent
  ],
  imports: [
    BrowserModule,
    HammerModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    IgxButtonModule,
    IgxRippleModule,
    IgxDialogModule,
    IgxIconModule,
    FormsModule,
    IgxToggleModule,
    IgxAvatarModule,
    IgxInputGroupModule,
    IgxDropDownModule,
    IgxSelectModule,
    MonacoEditorModule.forRoot(),
    IgxExcelModule,
    IgxSpreadsheetModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
