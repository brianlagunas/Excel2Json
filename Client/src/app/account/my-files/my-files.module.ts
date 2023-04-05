import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyFilesComponent } from './my-files.component';
import { MyFilesRoutingModule } from './my-files-routing.module';
import { IgxAvatarModule, IgxButtonModule, IgxCheckboxModule, IgxDialogModule, IgxIconModule, IgxInputGroupModule, IgxListModule, IgxRippleModule, IgxToggleModule, IgxTooltipModule } from 'igniteui-angular';
import { NavbarModule } from '../../navbar/navbar.module';
import { CodeEditorModule } from 'src/app/code-editor/code-editor.module';

@NgModule({
    declarations: [
      MyFilesComponent
    ],
    imports: [
      CommonModule,
      FormsModule,
      NavbarModule,
      CodeEditorModule,
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
    ]
  })
  export class MyFilesModule { }