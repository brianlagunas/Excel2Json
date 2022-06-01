import { ErrorValue, FormattedString, Workbook, WorkbookFormat, Worksheet, WorksheetCell, WorksheetRow, WorksheetTable } from "igniteui-angular-excel";

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
                const value = this.getCellValue(worksheet.rows(r).cells(c));
                dataObject[propertyName] = value;
                propertyNameIndex++;
            }

            dataObjects.push(dataObject);
        }

        return JSON.stringify(dataObjects, null, 4);
    }

    public static convertJsonToWorkbook(json: string, name?: string) : Workbook {
        const workbook = new Workbook(WorkbookFormat.Excel2007);
        const ws = workbook.worksheets().add(name === undefined ? "CVS Data" : name);
        
        if (json !== null && json !== "[]") {
            const csvRows = JSON.parse(json);
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
        }

        return workbook;
    }

    public static convertFlatDataToJson(worksheet: Worksheet): string {
        const headerRow = worksheet.rows(0);
        let propertyNames = this.getPropertyNamesFromRow(headerRow);

        let dataObjects = [];
        for (let r = 1; r < worksheet.rows().count; r++) {
            let dataObject: any = {};
            for (let x = 0; x < propertyNames.length; x++) {
                const propertyName = propertyNames[x];
                const cell = worksheet.rows(r).cells(x);
                dataObject[propertyName] = this.getCellValue(cell);
            }
            dataObjects.push(dataObject);
        }

        Excel.removeEmptyDataObjects(dataObjects);

        return JSON.stringify(dataObjects, null, 4);
    }

    static getPropertyNamesFromRow(row: WorksheetRow): string[] {
        let propertyNames: string[] = [];
        for (let currentIndex = 0; currentIndex < row.cells().count; currentIndex++) {
            const cell = row.cells(currentIndex);
            let propertyName = this.getHeaderText(cell)
            //look for duplicates
            if (propertyNames.includes(propertyName)) {
                let count = 0;
                //look through all cells up until our current index
                for (let previousIndex = 0; previousIndex < currentIndex; previousIndex++){
                    const previousPropertyName = this.getHeaderText(row.cells(previousIndex));
                    if (previousPropertyName === propertyName) {
                        count++;
                    }
                }
                propertyName = propertyName + count;
            }
            propertyNames.push(propertyName);
        }
        return propertyNames;
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

    static getCellValue(cell: WorksheetCell): any {
        let value = cell.value;

        const formatString = cell.getResolvedCellFormat().formatString;

        if (this.cellValueIsDate(value, formatString)) {
            value = cell.getText();
        }
        else if (value instanceof FormattedString) {
            value = value.unformattedString;
        }
        else if (value instanceof ErrorValue) {
            value = null;
        }

        return value;
    }

    static cellValueIsDate(value: any, formatString: string): boolean {
        let isDate = false;

        //Excel treats all dates as a number counting the number of days since 1/1/1900
        //the only way I can think of checking if the number is a date is by checking the formatString
        //if it contains any m (month) or y (year), then it's a date
        if (typeof value === 'number'){
            isDate = formatString.includes("m") || formatString.includes("y");
        }

        return isDate;
    }
}