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
  serverErrorMessage: string = "";
  form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });


  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    this.sub = this.route.queryParams.subscribe(async params => {
      const id = params["id"];
      const token = params["token"];

      if (id !== undefined && token !== undefined) {
        try {
          await this.authService.confirmEmail(id, token);
          this.confirmed = true;
        }
        catch (error: any) {
          this.serverErrorMessage = error;
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
