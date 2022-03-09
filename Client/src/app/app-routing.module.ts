import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './error-routing/not-found/not-found.component';
import { UncaughtErrorComponent } from './error-routing/error/uncaught-error.component';
import { ErrorRoutingModule } from './error-routing/error-routing.module';
import { UploadComponent } from './upload/upload.component';
import { AuthRouteGuard } from './_helpers/auth.routeguard';
import { RegisterComponent } from './account/register/register.component';
import { LoginComponent } from './account/login/login.component';
import { AccountComponent } from './account/account.component';
import { ConfirmComponent } from './account/confirm/confirm.component';
import { VerifyComponent } from './account/verify/verify.component';
import { ResendConfirmationComponent } from './account/resend-confirmation/resend-confirmation.component';

export const routes: Routes = [
  { path: '', component: UploadComponent, pathMatch: "full" },
  { path: 'error', component: UncaughtErrorComponent },
  { path: 'editor', loadChildren: () => import('./editor/editor.module').then(m => m.EditorModule) },
  { path: 'account', component: AccountComponent, children: [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'confirm', component: ConfirmComponent },
    { path: 'verify', component: VerifyComponent },
    { path: 'resend-confirmation', component: ResendConfirmationComponent },
  ] },
  { path: 'account/my-files', loadChildren: () => import('./account/my-files/my-files.module').then(m => m.MyFilesModule), canActivate: [ AuthRouteGuard] },
  { path: '**', component: PageNotFoundComponent } // must always be last
];

@NgModule({
  imports: [RouterModule.forRoot(routes), ErrorRoutingModule],
  exports: [RouterModule, ErrorRoutingModule]
})
export class AppRoutingModule {
}
