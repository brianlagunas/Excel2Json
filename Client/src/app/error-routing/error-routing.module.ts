import { NgModule, ErrorHandler, Provider } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UncaughtErrorComponent } from './error/uncaught-error.component';
import { GlobalErrorHandlerService } from './error/global-error-handler.service';
import { environment } from '../../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarModule } from '../navbar/navbar.module';

const providers: Provider[] = [];

if (environment.production) {
  // register prod error handler
  providers.push({ provide: ErrorHandler, useClass: GlobalErrorHandlerService });
}

@NgModule({
  declarations: [
    PageNotFoundComponent,
    UncaughtErrorComponent
  ],
  imports: [
    BrowserModule,
    NavbarModule
  ],
  providers
})
export class ErrorRoutingModule { }
