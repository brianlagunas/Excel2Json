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
import { User } from '../business/user';
import { AuthService } from '../services/auth.service';

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

  constructor(private authService: AuthService,
              private ref: ChangeDetectorRef,
              private router: Router) {
  }

  ngOnInit(): void {
    this.authService.observable().subscribe(user => {
      this.user = user;
      this.ref.detectChanges();
    });
  }

  signOut() {
    this.authService.signOut();
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
