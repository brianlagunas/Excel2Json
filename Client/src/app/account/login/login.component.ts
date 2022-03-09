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

  async loginWithGoogle() {
    try {
      await this.authService.signInGoogle();
      this.router.navigateByUrl('/account/my-files');
    }
    catch (error : any){
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
