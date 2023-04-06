import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  showPassword: boolean = false;
  serverErrorMessage: string = "";

  form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required])
  });

  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeGoogleLogin();
  }

  initializeGoogleLogin() {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: "400613385752-qt314c2r0dbnlkdrg6bmm1vave3nmsos.apps.googleusercontent.com",
      callback: (resp) => this.loginWithGoogle(resp),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // @ts-ignore
    google.accounts.id.renderButton(
      document.getElementById("google-button"),
      { text: "continue_with", theme: "outline", size: "large", width: "250px", }
    );
  }

  async signIn() {
    if (this.form.valid) {
      try {
        await this.authService.signIn(this.form.value.email, this.form.value.password);
        this.router.navigateByUrl('/account/my-files');
      }
      catch (error: any) {
        this.serverErrorMessage = error;
      }
    }
    else {
      Object.keys(this.form.controls).forEach(field => {
        const control = this.form.get(field);
        control?.markAllAsTouched();
        control?.updateValueAndValidity();
      });
    }
  }

  async loginWithGoogle(credentialResponse: any) {
    try {
      await this.authService.signInGoogle(credentialResponse.credential);
      this.router.navigateByUrl('/account/my-files');
    }
    catch (error: any) {
      this.serverErrorMessage = error;
    }
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  fieldHasError(field: string, error: string) {
    return ((this.form.get(field)?.touched || this.form.get(field)?.dirty) && this.form.get(field)?.errors?.[error]);
  }
}
