import { Workbook, WorkbookFormat, Worksheet, WorksheetCell, WorksheetTable } from "igniteui-angular-excel";

export class Excel {

    public static convertWorkbookToJson(workbook: Workbook): string {
        return this.convertWorksheetToJson(workbook.worksheets(0));
    }

    public static convertWorksheetToJson(worksheet: Worksheet): string {
        if (worksheet.tables().count > 0) {
            return this.convertTableToJson(worksheet.tables(0));
        }
        else {
            return this.convertFlatDataToJson(worksheet);
        }
    }

    public static convertTableToJson(table: WorksheetTable): string {
        const worksheet = table.worksheet;

        let propertyNames = [];
        const headers = table.headerRowRegion;
        for (const header of headers) {
            propertyNames.push(this.getHeaderText(header));
        }

        let dataObjects = [];
        const dataRegion = table.dataAreaRegion;
        for (let r = dataRegion.firstRow; r <= dataRegion.lastRow; r++) {
            let propertyNameIndex = 0;
            let dataObject: any = {};
            for (let c = dataRegion.firstColumn; c <= dataRegion.lastColumn; c++) {
                const propertyName = propertyNames[propertyNameIndex];
                const value = worksheet.rows(r).cells(c).value;
                dataObject[propertyName] = value;
                propertyNameIndex++;
            }

            dataObjects.push(dataObject);
        }

        return JSON.stringify(dataObjects, null, "\t");
    }

    public static convertJsonToWorkbook(json: string) : Workbook {
        const csvRows = JSON.parse(json);        
        const workbook = new Workbook(WorkbookFormat.Excel2007);
        const ws = workbook.worksheets().add("CSV Data");

        const headers = Object.keys(csvRows[0]);
        for (let x = 0; x < headers.length; x++){
            ws.rows(0).cells(x).value = headers[x];
        }

        for (let r = 0; r < csvRows.length; r++) {
            const dataRow = csvRows[r];
            const xlRow = ws.rows(r + 1);
            for (let h = 0; h < headers.length; h++) {
                xlRow.setCellValue(h, dataRow[headers[h]]);
            }
        }

        return workbook;
    }

    public static convertFlatDataToJson(worksheet: Worksheet): string {
        let propertyNames = [];
        const headerRow = worksheet.rows(0);
        for (let x = 0; x < headerRow.cells().count; x++) {
            const cell = headerRow.cells(x);
            propertyNames.push(this.getHeaderText(cell));
        }

        let dataObjects = [];
        for (let r = 1; r < worksheet.rows().count; r++) {
            let dataObject: any = {};
            for (let x = 0; x < propertyNames.length; x++) {
                const propertyName = propertyNames[x];
                const cell = worksheet.rows(r).cells(x);
                dataObject[propertyName] = cell.value;
            }
            dataObjects.push(dataObject);
        }

        Excel.removeEmptyDataObjects(dataObjects);

        return JSON.stringify(dataObjects, null, "\t");
    }

    static removeEmptyDataObjects(dataObjects: any[]) {
        let index = dataObjects.length;
        while (index--) {
            const dataObject = dataObjects[index];
            const isEmpty = Object.values(dataObject).every(o => o === null);
            if (isEmpty) {
                dataObjects.splice(index, 1);
            }
        }
    }

    static getHeaderText(cell: WorksheetCell): string {
        return cell.getText().replace(/ /g, "");
    }
}