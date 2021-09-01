import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxSpreadsheetActionExecutedEventArgs, IgxSpreadsheetActiveTableChangedEventArgs, IgxSpreadsheetActiveWorksheetChangedEventArgs, IgxSpreadsheetComponent, SpreadsheetAction } from 'igniteui-angular-spreadsheet';
import { environment } from 'src/environments/environment';
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
      Excel.loadExcelFile(file).then(workbook => {
        this.spreadsheet.workbook = workbook;
        if (this.spreadsheet.activeTable === null) {
          this.code = Excel.convertWorkbookToJson(workbook);
        }
      });
    }
  }

  onEditModeExited() {
    this.updateJsonOnEdit();
  }

  onActionExecuted(args: IgxSpreadsheetActionExecutedEventArgs) {
    if (args.command === SpreadsheetAction.ClearContents ||
        args.command === SpreadsheetAction.Undo ||
        args.command === SpreadsheetAction.Redo ||
        args.command === SpreadsheetAction.Paste) {

      this.updateJsonOnEdit();
    }
  }

  onActiveWorksheetChanged(args: IgxSpreadsheetActiveWorksheetChangedEventArgs) {
    const worksheet = args.newValue;
    if (worksheet) {
      this.code = Excel.convertWorksheetToJson(worksheet);
    }
  }

  onActiveTableChanged(args: IgxSpreadsheetActiveTableChangedEventArgs) {
    const table = args.newValue;
    if (table) {
      this.code = Excel.convertTableToJson(table);
    }
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
    let url = environment.baseUri;
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

  updateJsonOnEdit() {
    if (this.spreadsheet.activeTable) {
      this.code = Excel.convertTableToJson(this.spreadsheet.activeTable);
    }
    else {
      this.code = Excel.convertFlatDataToJson(this.spreadsheet.activeWorksheet);
    }
  }
}
