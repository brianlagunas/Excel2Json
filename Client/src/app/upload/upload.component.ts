import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileStorageService } from '../services/file-storage.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {

  constructor(private router: Router,
              private fileStorage: FileStorageService){

  }

  onNewFileClicked() {
    this.navigateToEditor(null);
  }

  onFileInputChanged(e: any) {
    const file = e.target.files[0] as File;
    this.navigateToEditor(file);
  }

  onDragOver(e: any) {
    e.preventDefault();
  }

  onDrop(e: any) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0] as File;
    this.navigateToEditor(file);
  }

  navigateToEditor(file: File | null) {
    this.fileStorage.file = file;
    this.router.navigateByUrl("editor");
  }
}
