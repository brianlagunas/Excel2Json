import { NgModule } from '@angular/core';
import { CodeEditorComponent } from './code-editor.component';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        CodeEditorComponent
    ],
    exports: [
        CodeEditorComponent
    ],
    imports: [
        FormsModule,
        MonacoEditorModule
     ]
  })
  export class CodeEditorModule { }