import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { File } from '../business/file';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor() { }

    public async getFiles(): Promise<File[]> {

        let url = environment.filesUri;
        let params = {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        }

        var resp = await fetch(url, params);
        return resp.json();
    }

    public async deleteFile(id: string): Promise<File> {

        let url = `${environment.filesUri}/${id}`;
        let params = {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            method: "DELETE",
        }

        var resp = await fetch(url, params);
        return resp.json();
    }
}