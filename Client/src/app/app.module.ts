import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadComponent } from './upload/upload.component';
import { IgxButtonModule, IgxDialogModule, IgxIconModule, IgxToggleModule, IgxAvatarModule, IgxInputGroupModule } from 'igniteui-angular';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './editor/editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    HammerModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    IgxButtonModule,
    IgxDialogModule,
    IgxIconModule,
    FormsModule,
    IgxToggleModule,
    IgxAvatarModule,
    IgxInputGroupModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
