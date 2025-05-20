/**
 * CSV utility class.
 * Provides functionality to convert CSV files to JSON.
 * Properly handles quoted fields that may contain delimiter characters.
 */
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
        const headers = this.parseCSVLine(lines[0], delimiter);
        let results = [];

        for (let x = 1; x < lines.length - 1; x++) {
            let obj: any = {};
            const currentLine = this.parseCSVLine(lines[x], delimiter);

            for (let y = 0; y < headers.length; y++) {
                obj[headers[y]] = currentLine[y];
            }

            results.push(obj);
        }

        return JSON.stringify(results, null, "\t");
    }
    
    /**
     * Parse a CSV line, respecting quoted fields that may contain delimiters
     */
    private static parseCSVLine(line: string, delimiter: string): string[] {
        const result: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                // Toggle the inQuotes status
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                // End of field, add to result and reset currentField
                result.push(currentField.trim());
                currentField = '';
            } else {
                // Add character to current field
                currentField += char;
            }
        }
        
        // Add the last field
        result.push(currentField.trim());
        
        // Remove surrounding quotes from quoted fields
        return result.map(field => {
            if (field.startsWith('"') && field.endsWith('"')) {
                return field.substring(1, field.length - 1);
            }
            return field;
        });
    }
}