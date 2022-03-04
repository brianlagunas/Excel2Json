import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IgxAvatarModule, IgxButtonModule, IgxDividerModule, IgxDropDownModule, IgxIconModule, IgxToggleModule } from 'igniteui-angular';
import { NavbarComponent } from './navbar.component';

@NgModule({
    declarations: [
      NavbarComponent
    ],
    exports: [
      NavbarComponent
    ],
    imports: [
      CommonModule,
      RouterModule,
      IgxAvatarModule,
      IgxDividerModule,
      IgxIconModule,
      IgxToggleModule,
      IgxDropDownModule,
      IgxButtonModule
    ]
  })
  export class NavbarModule { }