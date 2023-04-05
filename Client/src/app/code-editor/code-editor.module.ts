import { NgModule } from '@angular/core';
import { CodeEditorComponent } from './code-editor.component';

@NgModule({
    declarations: [
        CodeEditorComponent
    ],
    exports: [
        CodeEditorComponent
    ],
    imports: [ ]
  })
  export class CodeEditorModule { }