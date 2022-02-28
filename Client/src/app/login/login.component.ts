import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";
  showPassword: boolean = false;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
  }

  async signIn() {
    await this.authService.signIn(this.email, this.password);
    this.router.navigateByUrl('/my-files');
  }

  async loginWithGoogle() {
    await this.authService.signInGoogle();
    this.router.navigateByUrl('/my-files');
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
