import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  serverErrorMessage: string = "";

  form: FormGroup = new FormGroup({
    email: new FormControl("", [ Validators.required, Validators.email]),      
    password: new FormControl("", [ Validators.required, Validators.minLength(6) ]),
    passwordConfirm: new FormControl("", [ Validators.required ]),         
  }, this.passwordMatchValidator);

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {  }

  async register() {
    if (this.form.valid){
      try {
        await this.authService.register(this.form.value.email, this.form.value.password);
        this.router.navigateByUrl('/account/verify');
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
}
