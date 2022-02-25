import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleSigninService } from '../services/google-signin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private googleSignInService: GoogleSigninService, private router: Router) { }

  ngOnInit(): void {
  }

  loginWithGoogle() {
    this.googleSignInService.signin();
    this.router.navigateByUrl('/')
  }

}
