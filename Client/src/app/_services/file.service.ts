import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { File } from '../business/file';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor(private httpClient: HttpClient) { }

    public async CreateFile(name: string, text: string): Promise<string> {
        let url = environment.filesUri;

        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });

        var body = JSON.stringify({
            name: name,
            text: text
        });

        var result = await this.httpClient.post<any>(url, body, { headers }).toPromise();
        return result.id;
    }

    public async getFile(id: string): Promise<File | null> {
        let url = `${environment.filesUri}/${id}`;
        try {
            return this.httpClient.get<File>(url).toPromise();
        }
        catch (error: any) {
            console.log("Error getting file: " + error.status);
            return null;
        }
    }

    public async getFiles(): Promise<File[]> {
        let files: File[] = [];
        try {
            files = await this.httpClient.get<File[]>(environment.filesUri).toPromise();
        }
        catch (error: any) {
            console.log("Error getting files: " + error.status);
        }
        return files;
    }

    public async deleteFile(id: string): Promise<File> {

        let url = `${environment.filesUri}/${id}`;
        return this.httpClient.delete<File>(url).toPromise();
    }

    public async updateFile(file: File) {

        let url = `${environment.filesUri}/${file.id}`;

        var headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });

        var body = JSON.stringify({
            canShare: file.canShare,
            name: file.name,
            text: file.text
        });

        await this.httpClient.put<any>(url, body, { headers }).toPromise();
    }
}