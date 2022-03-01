
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectedPositioningStrategy, HorizontalAlignment, NoOpScrollStrategy, OverlaySettings, VerticalAlignment } from 'igniteui-angular';
import { User } from '../business/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() title: string | null = null;
  @Input() showUploadButton: boolean = false;
  @Input() showDownloadButton: boolean = false;
  @Input() showGetLinkButton: boolean = false;

  @Output() downloadJsonClick: EventEmitter<void> = new EventEmitter();
  @Output() getLinkClick: EventEmitter<void> = new EventEmitter();

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
              private router: Router) { }

  ngOnInit(): void {
    this.authService.observable().subscribe(user => {
      this.user = user;
      this.ref.detectChanges();
    });
  }

  onDownloadJsonClicked() {
    this.downloadJsonClick.emit();
  }

  onGetLinkClicked() {
    this.getLinkClick.emit();
  }

  signOut() {
    this.authService.signOut();
    if (this.router.url == "/my-files") {
      this.router.navigateByUrl('/')
    }    
  }
}