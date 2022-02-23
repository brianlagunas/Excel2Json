import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  ConnectedPositioningStrategy,
  HorizontalAlignment,
  IgxAvatarModule,
  IgxDividerModule,
  IgxDropDownModule,
  IgxIconModule,
  IgxToggleModule,
  NoOpScrollStrategy,
  VerticalAlignment
} from 'igniteui-angular';
import { GoogleSigninService } from '../services/google-signin.service';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent implements OnInit {

  public overlaySettings = {
    positionStrategy: new ConnectedPositioningStrategy({
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Bottom
    }),
    scrollStrategy: new NoOpScrollStrategy()
  };

  user: gapi.auth2.GoogleUser | null = null;

  test: boolean = false;

  constructor(private googleSignInService: GoogleSigninService,
              private ref: ChangeDetectorRef, 
              private ngZone: NgZone, 
              private router: Router){
  }

  ngOnInit(): void {
    this.googleSignInService.observable().subscribe( user => {
      this.user = user;
      this.ref.detectChanges();
    });
  }

  signIn() {
    this.googleSignInService.signin();
  }

  signOut() {
    this.googleSignInService.signout();
  }

  navigateToMyFiles() {
    this.ngZone.run(() => {
      this.router.navigateByUrl('/my-files')
    })
  }

}
@NgModule({
  declarations: [
    HelpMenuComponent
  ],
  exports: [
    HelpMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IgxAvatarModule,
    IgxDividerModule,
    IgxIconModule,
    IgxToggleModule,
    IgxDropDownModule
  ]
})
export class HelpModule {}
