import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  sub: Subscription;
  emailParam: string = "";
  tokenParam: string = "";
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  serverErrorMessage: string = "";

  form: FormGroup = new FormGroup({
    password: new FormControl("", [ Validators.required, Validators.minLength(6) ]),
    passwordConfirm: new FormControl("", [ Validators.required ]),         
  }, this.passwordMatchValidator);

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { 
    this.sub = this.route.queryParams.subscribe(async params => {
      const email = params["email"];
      const token = params["token"];

      if (email !== undefined && token !== undefined) {
        this.emailParam = email;
        this.tokenParam = token;
      }
    });
  }

  ngOnInit(): void {
  }

  async resetPassword() {
    if (this.form.valid){
      try {
        await this.authService.resetPassword(this.emailParam, this.form.value.password, this.tokenParam);
        this.router.navigateByUrl("/account/login");
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

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  showHideConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(c: AbstractControl): { [key: string]: boolean} | null {
    const passwordControl = c.get('password')!;
    const passwordConfirmControl = c.get('passwordConfirm')!;
    
    if (passwordControl.pristine && passwordConfirmControl.pristine) {
      return null;
    }

    if (passwordControl.value === passwordConfirmControl.value) {
      return null;
    }
    
    //force the error on the control
    passwordConfirmControl.setErrors({ passwordMistmatch: true });

    //return group level error
    return { passwordMistmatch: true }
  }

  fieldHasError(field: string, error: string) {
    return ((this.form.get(field)?.touched || this.form.get(field)?.dirty) && this.form.get(field)?.errors?.[error]);
  }

  fieldHasErrors(field: string) {
    return ((this.form.get(field)?.touched || this.form.get(field)?.dirty) && this.form.get(field)?.errors != null);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
