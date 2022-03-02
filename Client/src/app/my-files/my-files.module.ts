import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyFilesComponent } from './my-files.component';
import { MyFilesRoutingModule } from './my-files-routing.module';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { IgxAvatarModule, IgxButtonModule, IgxCheckboxModule, IgxDialogModule, IgxIconModule, IgxInputGroupModule, IgxListModule, IgxRippleModule, IgxToggleModule, IgxTooltipModule } from 'igniteui-angular';
import { NavbarModule } from '../navbar/navbar.module';

@NgModule({
    declarations: [
      MyFilesComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      NavbarModule,
      MyFilesRoutingModule,
      IgxButtonModule,
      IgxListModule,
      IgxDialogModule,
      IgxAvatarModule,
      IgxInputGroupModule,
      IgxIconModule,
      IgxRippleModule,
      IgxToggleModule,
      IgxCheckboxModule,
      IgxTooltipModule,
      MonacoEditorModule.forRoot(),
    ]
  })
  export class MyFilesModule { }