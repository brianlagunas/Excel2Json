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
  
  loadingDialogTitle: string = "";
  editorOptions = { theme: 'vs-dark', language: 'javascript', readOnly: true };
  code: string = "";
  files: File[] = [];
  shareLink: string = "";
  selectedItemId: string = "";
  listActionClicked: boolean = false;

  constructor(private fileService: FileService) { }

  async ngOnInit() {
    this.loadingDialogTitle = "Loading Files...";
    this.files = await this.fileService.getFiles();
    this.loadingDialog.close();
  }

  ngAfterViewInit(): void {
    this.loadingDialog.open();
  }

  async loadFileText(id: string) {

    //prevent from loading a file that's already loaded
    //also if a list action was clicked, don't load the file
    if (this.selectedItemId == id || this.listActionClicked) {
      this.listActionClicked = false;
      return;
    }    

    this.loadingDialogTitle = "Loading JSON..."
    this.loadingDialog.open();
    try {
      var file = await this.fileService.getFile(id);
      if (file != null && file.text !== null) {
        this.code = JSON.stringify(JSON.parse(file.text), null, 4);
      }
      else {
        this.code = "[]";
      }  
    }
    catch {
      //ignore errors
    }
    finally {
      this.loadingDialog.close();
      this.selectedItemId = id;
    }
  }

  onEditClick() {
    this.listActionClicked = true;
  }

  deleteFile(id: string) {
    this.code = "";
    this.files = this.files.filter(x => x.id != id);
    this.fileService.deleteFile(id);    
  }

  async updateCanShare(file: File) {
    this.listActionClicked = true;
    await this.fileService.updateCanShare(file);
  }

  getShareLink(id: string) {
    this.listActionClicked = true;
    this.shareLink = `${environment.shareUri}/${id}`;
  }

  onCopyShareLinkClicked() {
    var shareLinkInput: any = document.getElementById("shareLinkInputField");
    shareLinkInput.select();
    navigator.clipboard.writeText(this.shareLink);
  }
}
