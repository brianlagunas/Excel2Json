import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpModule } from '../help-menu/help-menu.component';
import { MyFilesComponent } from './my-files.component';
import { MyFilesRoutingModule } from './my-files-routing.module';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { IgxAvatarModule, IgxDialogModule, IgxIconModule, IgxInputGroupModule, IgxListModule, IgxRippleModule, IgxToggleModule } from 'igniteui-angular';

@NgModule({
    declarations: [
      MyFilesComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      HelpModule,
      MyFilesRoutingModule,
      IgxListModule,
      IgxDialogModule,
      IgxAvatarModule,
      IgxInputGroupModule,
      IgxIconModule,
      IgxRippleModule,
      IgxToggleModule,
      MonacoEditorModule.forRoot(),
    ]
  })
  export class MyFilesModule { }