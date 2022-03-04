import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IgxDialogComponent } from 'igniteui-angular';
import { Delimiter } from '../business/delimiter';
import { FileStorageService } from '../_services/file-storage.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {

  @ViewChild("delimiterDialog")
  delimiterDialog!: IgxDialogComponent;

  delimiterMenuItems: Delimiter[] = [
    { name: "Colon", symbol: ":" },
    { name: "Comma", symbol: "," },
    { name: "Semicolon", symbol: ";" },
  ]

  selectedDelimiter: Delimiter = this.delimiterMenuItems[1];

  constructor(private router: Router,
              private fileStorage: FileStorageService){

  }

  onNewFileClicked() {
    this.handleFile(null);
  }

  onFileInputChanged(e: any) {
    const file = e.target.files[0] as File;
    this.handleFile(file);
  }

  onDragOver(e: any) {
    e.preventDefault();
  }

  onDrop(e: any) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0] as File;
    this.handleFile(file);
  }

  handleFile(file: File | null) {
    this.fileStorage.file = file;

    const fileExtension = file ? file.name.split(".").pop() : "xlsx";    
    if (fileExtension === "csv") {
      this.delimiterDialog.open();
    }
    else{
      this.navigateToEditor();
    }
  }

  onDelimiterDialogClosing() {
    this.fileStorage.delimiterSymbol = this.selectedDelimiter.symbol;
    this.navigateToEditor();
  }

  navigateToEditor() {    
    this.router.navigateByUrl("editor");
  }
}
