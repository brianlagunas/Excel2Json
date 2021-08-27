import { Component, OnInit } from '@angular/core';
import { CSV } from '../io/csv';
import { FileStorageService } from '../services/file-storage.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  editorOptions = {theme: 'vs-dark', language: 'javascript', readOnly: true};
  fileName: string = "New File";
  code: string = "[]";

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
      });
    }
    else {
      //todo: load excel
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

  onGetLinkClicked() {
    const url = "https://localhost:44307/api/share";

    const params = {
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: this.code,
      method: "POST"
    }

    fetch(url, params).then( result => {
      console.log(result);
    });

  }

}
