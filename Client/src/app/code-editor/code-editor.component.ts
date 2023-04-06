import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent {

  editorOptions = { theme: 'vs-dark', language: 'json', readOnly: true, contextmenu: false };

  @Input() code: string = "[]";

  constructor() { }
}
