export class CSV {

    public static loadCsvFile(file: File) : Promise<string> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onerror = (e: any) => {
                reject(fileReader.error);
            }

            fileReader.onload = (e: any) => {
                var json = this.convertCsvToJson(e.target.result);
                resolve(json);
            }

            fileReader.readAsText(file);
        })
    }

    static convertCsvToJson(csv: string): string {
        const lines = csv.split("\r");
        const headers = lines[0].split(",");
        let results = [];

        for (let x = 1; x < lines.length; x++) {
            let obj: any = {};
            const currentLine = lines[x].split(",").map(s => s.trim());

            for (let y = 0; y < headers.length; y++) {
                obj[headers[y]] = currentLine[y];
            }

            results.push(obj);
        }

        return JSON.stringify(results);
    }
}