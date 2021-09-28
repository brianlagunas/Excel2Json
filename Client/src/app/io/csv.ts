export class CSV {

    public static loadCsvFile(file: File, delimiter: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onerror = (e: any) => {
                reject(fileReader.error);
            }

            fileReader.onload = (e: any) => {
                var json = this.convertCsvToJson(e.target.result, delimiter);
                resolve(json);
            }

            fileReader.readAsText(file);
        })
    }

    static convertCsvToJson(csv: string, delimiter: string): string {
        const lines = csv.split("\r");
        const headers = lines[0].split(delimiter);
        let results = [];

        for (let x = 1; x < lines.length - 1; x++) {
            let obj: any = {};
            const currentLine = lines[x].split(delimiter).map(s => s.trim());

            for (let y = 0; y < headers.length; y++) {
                obj[headers[y]] = currentLine[y];
            }

            results.push(obj);
        }

        return JSON.stringify(results, null, "\t");
    }
}