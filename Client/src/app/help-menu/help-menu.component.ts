import { Component, NgModule } from '@angular/core';
import {
  ConnectedPositioningStrategy,
  HorizontalAlignment,
  IgxDropDownModule,
  IgxIconModule,
  IgxToggleModule,
  NoOpScrollStrategy,
  VerticalAlignment
} from 'igniteui-angular';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent {

  public overlaySettings = {
    positionStrategy: new ConnectedPositioningStrategy({
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Bottom
    }),
    scrollStrategy: new NoOpScrollStrategy()
  };

}
@NgModule({
  declarations: [
    HelpMenuComponent
  ],
  exports: [
    HelpMenuComponent
  ],
  imports: [
    IgxIconModule,
    IgxToggleModule,
    IgxDropDownModule
  ]
})
export class HelpModule {}
