import { Component, OnInit } from '@angular/core';
import { FileService } from '../../_services/file.service';
import { File } from '../../business/file';
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

  async ngOnInit() {
    this.files = await this.fileService.getFiles();
  }

  loadFileText(text: string) {
    this.code = text;
  }

  async deleteFile(id: string) {
    await this.fileService.deleteFile(id);
    this.files = this.files.filter(x => x.id != id);
    this.code = "";
  }

  async updateCanShare(file: File) {
    await this.fileService.updateFile(file);
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
