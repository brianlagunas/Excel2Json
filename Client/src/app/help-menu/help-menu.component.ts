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
  OverlaySettings,
  VerticalAlignment
} from 'igniteui-angular';
import { ConcatOperator } from 'igniteui-angular-excel';
import { User } from '../business/user';
import { GoogleSigninService } from '../services/google-signin.service';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent implements OnInit {

  user: User | null = null;
  overlaySettings: OverlaySettings = {
    positionStrategy: new ConnectedPositioningStrategy({
      horizontalDirection: HorizontalAlignment.Left,
      horizontalStartPoint: HorizontalAlignment.Right,
      verticalStartPoint: VerticalAlignment.Bottom
    }),
    scrollStrategy: new NoOpScrollStrategy()
  };

  constructor(private googleSignInService: GoogleSigninService,
              private ref: ChangeDetectorRef,
              private router: Router) {
  }

  ngOnInit(): void {
    this.googleSignInService.observable().subscribe(user => {
      this.user = user;
      this.ref.detectChanges();
    });
  }

  signOut() {
    this.googleSignInService.signout();

    if (this.router.url == "/my-files") {
      this.router.navigateByUrl('/')
    }    
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
export class HelpModule { }
