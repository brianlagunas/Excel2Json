import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  email: string = "";
  password: string = "";

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  async register() {
    await this.authService.register(this.email, this.password);    
    this.router.navigateByUrl('/my-files');
  }

}
