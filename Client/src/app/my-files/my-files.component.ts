import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { File } from '../business/file';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-files',
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.scss']
})
export class MyFilesComponent implements OnInit {

  editorOptions = { theme: 'vs-dark', language: 'javascript', readOnly: true };
  code: string = "";
  files: File[] = [];
  shareLink: string = "";

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.fileService.getFiles().then(response => {
      this.files = response;
    });
  }

  loadFileText(text: string) {
    this.code = text;
  }

  deleteFile(id: string) {
    this.fileService.deleteFile(id).then(response => {
      this.files = this.files.filter(x => x.id != id);
      this.code = "";
    });
  }

  getShareLink(id: string) {
    this.shareLink = `${environment.shareUri}/${id}`;
  }

  onCopyShareLinkClicked() {
    var shareLinkInput: any = document.getElementById("shareLinkInputField");
    shareLinkInput.select();
    navigator.clipboard.writeText(this.shareLink);
  }

}
