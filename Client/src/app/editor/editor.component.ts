import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxSpreadsheetComponent } from 'igniteui-angular-spreadsheet';
import { CSV } from '../io/csv';
import { Excel } from '../io/excel';
import { FileStorageService } from '../services/file-storage.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @ViewChild("spreadsheet", { read: IgxSpreadsheetComponent })
  spreadsheet!: IgxSpreadsheetComponent;
  editorOptions = {theme: 'vs-dark', language: 'javascript', readOnly: true};
  fileName: string = "New File";
  code: string = "[]";
  shareLink: string | null = "ERROR - link not generated";
  shareId: string = "";

  constructor(private fileStorage: FileStorageService) {

  }

  ngOnInit() {
    if(this.fileStorage.file){
      this.fileName = this.fileStorage.file.name;
      this.loadFile(this.fileStorage.file);
    }
  }

  loadFile(file: File) {
    const fileExtension = file.name.split(".").pop();

    if (fileExtension === "csv") {
      CSV.loadCsvFile(file).then(json => {
        this.code = json;
        this.spreadsheet.workbook = Excel.convertJsonToWorkbook(json);
      });
    }
    else {
      //todo: load excel
    }
  }

  onWorkbookDirtied() {
    const ws = this.spreadsheet.workbook.worksheets(0);

    this.code = Excel.convertFlatDataToJson(ws);
  }

  onDownloadJsonClicked() {
    var a = document.createElement("a");
    a.download = "excel2json-" + Date.now() + ".json";
    const blob = new Blob([this.code], {
      type: "text/json;charset=utf-8"
    });
    a.href = window.URL.createObjectURL(blob);
    a.click();
  }

  async onGetLinkClicked() {
    let url = "https://localhost:44307/api/share";
    let params = {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(this.code),
      method: "POST"
    }

    if (this.shareId) {      
      url = this.shareLink!;
      params.method = "PUT";
    }

    var resp = await fetch(url, params);
    this.shareLink = resp.headers.get("location");
    this.shareId = await resp.text();
  }

  onCopyShareLinkClicked(){
    var shareLinkInput: any = document.getElementById("shareLinkInputField");
    shareLinkInput.select();
    document.execCommand('copy');
  }

}
