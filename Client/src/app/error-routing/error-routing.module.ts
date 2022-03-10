import { NgModule, ErrorHandler, Provider } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UncaughtErrorComponent } from './uncaught-error/uncaught-error.component';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import { environment } from '../../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarModule } from '../navbar/navbar.module';
import { ErrorComponent } from './error/error.component';

const providers: Provider[] = [];

if (environment.production) {
  // register prod error handler
  providers.push({ provide: ErrorHandler, useClass: GlobalErrorHandlerService });
}

@NgModule({
  declarations: [
    PageNotFoundComponent,
    UncaughtErrorComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    NavbarModule
  ],
  providers
})
export class ErrorRoutingModule { }
