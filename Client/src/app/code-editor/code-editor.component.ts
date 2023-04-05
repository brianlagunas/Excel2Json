import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() code: string = "[]";
  
  @ViewChild('container', { static: true }) container!: ElementRef;

  editor!: monaco.editor.IStandaloneCodeEditor;

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    this.editor = monaco.editor.create(this.container.nativeElement, {
      theme: 'vs-dark',
      value: this.code,
      language: 'json',
      readOnly: true,
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.code) {
      this.editor?.setValue(changes.code.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.editor.dispose();
  }

}
