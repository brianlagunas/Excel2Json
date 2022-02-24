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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
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
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptorService,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
