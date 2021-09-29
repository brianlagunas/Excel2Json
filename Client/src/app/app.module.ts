import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxButtonModule, IgxDialogModule, IgxIconModule, IgxAvatarModule, IgxInputGroupModule,
         IgxSelectModule, IgxRippleModule } from 'igniteui-angular';
import { FormsModule } from '@angular/forms';

import { UploadComponent } from './upload/upload.component';
import { HelpModule } from './help-menu/help-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent
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
    IgxAvatarModule,
    IgxInputGroupModule,
    IgxSelectModule,
    HelpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
