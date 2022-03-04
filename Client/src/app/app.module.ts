import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxButtonModule, IgxDialogModule, IgxIconModule, IgxAvatarModule, IgxInputGroupModule,
         IgxSelectModule, IgxRippleModule, IgxCheckboxModule } from 'igniteui-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UploadComponent } from './upload/upload.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './_helpers/auth.interceptor';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavbarModule } from './navbar/navbar.module';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HammerModule,
    AppRoutingModule,
    NavbarModule,
    BrowserAnimationsModule,
    IgxButtonModule,
    IgxRippleModule,
    IgxDialogModule,
    IgxIconModule,
    IgxCheckboxModule,
    IgxAvatarModule,
    IgxInputGroupModule,
    IgxSelectModule,
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
