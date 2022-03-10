import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FileService } from '../../_services/file.service';
import { File } from '../../business/file';
import { environment } from 'src/environments/environment';
import { IgxDialogComponent } from 'igniteui-angular';

@Component({
  selector: 'app-my-files',
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.scss']
})
export class MyFilesComponent implements OnInit, AfterViewInit {

  @ViewChild("loadingDialog")
  loadingDialog!: IgxDialogComponent;
  
  editorOptions = { theme: 'vs-dark', language: 'javascript', readOnly: true };
  code: string = "";
  files: File[] = [];
  shareLink: string = "";

  constructor(private fileService: FileService) { }

  async ngOnInit() {
    this.files = await this.fileService.getFiles();
    this.loadingDialog.close();
  }

  ngAfterViewInit(): void {
    this.loadingDialog.open();
  }

  async loadFileText(id: string) {
    try {
      var file = await this.fileService.getFile(id);
      if (file != null) {
        this.code = file.text;
      }
      else {
        this.code = "[]";
      }  
    }
    catch {
      //ignore errors
    }
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
