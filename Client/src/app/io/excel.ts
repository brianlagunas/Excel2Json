import { Workbook, WorkbookFormat, Worksheet } from "igniteui-angular-excel";

export class Excel {

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
            for (let h = 0; h < headers.length; h ++) {
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
            propertyNames.push(cell.value);
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
}