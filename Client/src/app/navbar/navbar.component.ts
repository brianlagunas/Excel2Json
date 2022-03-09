
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConnectedPositioningStrategy, HorizontalAlignment, NoOpScrollStrategy, OverlaySettings, VerticalAlignment } from 'igniteui-angular';
import { User } from '../business/user';
import { AuthService } from '../_services/auth.service';

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
  @Output() saveFileClick: EventEmitter<void> = new EventEmitter();

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
              private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.authService.observable().subscribe(user => {
      this.user = user;
      this.ref.detectChanges();
    });
  }

  onDownloadJsonClicked() {
    this.downloadJsonClick.emit();
  }

  onSaveFileClicked() {
    this.saveFileClick.emit();
  }

  async signOut() {
    await this.authService.signOut();  
  }
}