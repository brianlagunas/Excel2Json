import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GoogleSigninService } from '../services/google-signin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";

  constructor(private authService: AuthService,
              private googleSignInService: GoogleSigninService,
              private router: Router) { }

  ngOnInit(): void {
  }

  async signIn() {
    await this.authService.signIn(this.email, this.password);
    this.router.navigateByUrl('/my-files');
  }

  async loginWithGoogle() {
      await this.googleSignInService.signin();
      this.router.navigateByUrl('/my-files');
  }
}
