import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit, OnDestroy {

  sub: Subscription;
  confirmed: boolean = false;
  showResend: boolean = false;
  serverErrorMessage: string = "";
  form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });


  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) { 
    this.sub = this.route.queryParams.subscribe(async params => {
      const id= params["id"];
      const token = params["token"];
      const resend = params["resend"];

      if (id !== undefined && token !== undefined && resend === undefined) {
        const result = await this.authService.confirmEmail(id, token);
        if (result) {
          this.confirmed = true;
        }
      }
      
      if (resend !== undefined && resend === "true") {
        this.showResend = true;
      }
    });
  }

  ngOnInit(): void {  
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  showResendForm() {
    this.showResend = true;
  }

  async resendEmail() {
    if (this.form.valid) {
      try {
        await this.authService.resendConfirmationEmail(this.form.value.email);
        this.showResend = false;
      }
      catch (error: any){
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

  fieldHasError(field: string, error: string) {
    return ((this.form.get(field)?.touched || this.form.get(field)?.dirty) && this.form.get(field)?.errors?.[error]);
  }
}
