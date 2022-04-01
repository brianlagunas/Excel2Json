import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IgxDialogComponent } from 'igniteui-angular';
import { Workbook } from 'igniteui-angular-excel';
import { IgxSpreadsheetActionExecutedEventArgs, IgxSpreadsheetActiveTableChangedEventArgs, IgxSpreadsheetActiveWorksheetChangedEventArgs, IgxSpreadsheetComponent, SpreadsheetAction } from 'igniteui-angular-spreadsheet';
import { environment } from 'src/environments/environment';
import { CSV } from '../io/csv';
import { Excel } from '../io/excel';
import { FileStorageService } from '../_services/file-storage.service';
import { FileService } from '../_services/file.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  @ViewChild("spreadsheet", { read: IgxSpreadsheetComponent })
  spreadsheet!: IgxSpreadsheetComponent;
  @ViewChild("loadingDialog")
  loadingDialog!: IgxDialogComponent;
  @ViewChild("dialogWindow")
  dialogWindow!: IgxDialogComponent;

  fileIdForEdit: string | null = null;
  editorOptions = { theme: 'vs-dark', language: 'javascript', readOnly: true };
  fileName: string = "New File";
  code: string = "[]";
  workbookIds: Map<string, string> = new Map<string, string>();
  dialogWindowTitle = "Saving file...";
  shareLink: string = "";

  constructor(private fileStorage: FileStorageService,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router) {

  }

  async ngAfterViewInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id !== undefined && id !== null) {
      await this.loadFromExistingFile(id);
    }
    else {
      this.loadFromFileStorage();
    }
  }

  ngOnDestroy(): void {
    this.fileStorage.file = null;
    this.fileIdForEdit = null;
  }

  async loadFromExistingFile(id: string) {
    this.loadingDialog.open();
    try {
      const file = await this.fileService.getFile(id);
      if (file !== null) {
        this.fileIdForEdit = file.id;
        this.fileName = file.name;
        this.spreadsheet.workbook = Excel.convertJsonToWorkbook(file.text, file.name);
        this.spreadsheet.allowAddWorksheet = false;
      }
    }
    catch { // if we hit this, it's most likey an authorization error
      this.router.navigateByUrl("/editor");
    }
    finally {
      this.loadingDialog.close();
    }
  }

  loadFromFileStorage() {
    this.fileIdForEdit = null;
    if (this.fileStorage.file) {
      this.fileName = this.fileStorage.file.name;
      this.loadFile(this.fileStorage.file);
    }
  }

  loadFile(file: File) {
    const fileExtension = file.name.split(".").pop();

    this.loadingDialog.open();
    if (fileExtension === "csv") {
      CSV.loadCsvFile(file, this.fileStorage.delimiterSymbol).then(json => {
        this.spreadsheet.workbook = Excel.convertJsonToWorkbook(json);
        this.loadingDialog.close();
      });
    }
    else {
      Workbook.load(file, (workbook) => {
        this.spreadsheet.workbook = workbook;
        this.loadingDialog.close();
      }, (error) => console.log(error));
    }
  }

  onEditModeExited() {
    this.updateJsonOnEdit();
  }

  onActionExecuted(args: IgxSpreadsheetActionExecutedEventArgs) {
    if (args.command === SpreadsheetAction.ClearContents ||
      args.command === SpreadsheetAction.Undo ||
      args.command === SpreadsheetAction.Redo ||
      args.command === SpreadsheetAction.Paste ||
      args.command === SpreadsheetAction.DeleteRows ||
      args.command === SpreadsheetAction.SortAscending ||
      args.command === SpreadsheetAction.SortDescending) {

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

  async onSaveFileClicked() {

    this.shareLink = "";
    this.dialogWindowTitle = "Saving file..."
    this.dialogWindow.open();

    const activeWorksheetName = this.spreadsheet.activeWorksheet.name;
    let fileExists = false;
    let id = this.fileIdForEdit;

    if (id !== null) { //we are editing an existing file
      await this.fileService.updateFile({
        id: id,
        name: activeWorksheetName,
        text: this.code,
        canShare: true
      });
      fileExists = true;
    }
    else { //we are editing a newly created file
      if (this.workbookIds.has(activeWorksheetName)) {
        id = this.workbookIds.get(activeWorksheetName)!;

        await this.fileService.updateFile({
          id: id,
          name: activeWorksheetName,
          text: this.code,
          canShare: true
        });

        fileExists = true;
      } else {
        id = await this.fileService.CreateFile(activeWorksheetName, this.code);
      }
    }

    this.fileName = activeWorksheetName;

    this.dialogWindowTitle = "File Saved"
    this.shareLink = `${environment.shareUri}/${id}`;

    if (!fileExists && id != null) {
      this.workbookIds.set(activeWorksheetName, id);
    }
  }

  onCopyShareLinkClicked() {
    var shareLinkInput: any = document.getElementById("shareLinkInputField");
    shareLinkInput.select();
    navigator.clipboard.writeText(this.shareLink);
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
