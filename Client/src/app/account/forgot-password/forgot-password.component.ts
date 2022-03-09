import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  passwordResetEmailSent: boolean = false;
  serverErrorMessage: string = "";
  form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  async resetPassword() {
    if (this.form.valid) {
      try {
        await this.authService.sendPasswordResetEmail(this.form.value.email);
      }
      catch (error: any){
        //ignore any errors
      }
      finally{
        this.passwordResetEmailSent = true;
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

  forgotPassword() {
    this.passwordResetEmailSent = false;
  }

  fieldHasError(field: string, error: string) {
    return ((this.form.get(field)?.touched || this.form.get(field)?.dirty) && this.form.get(field)?.errors?.[error]);
  }

}
