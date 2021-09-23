import { Component, OnInit } from '@angular/core';
import { ConnectedPositioningStrategy, HorizontalAlignment, NoOpScrollStrategy, VerticalAlignment } from 'igniteui-angular';

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

  constructor() { }

  ngOnInit(): void {
  }

}
