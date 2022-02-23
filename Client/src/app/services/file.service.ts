import { Injectable } from '@angular/core';
import { FilterExpression, Tile } from 'igniteui-angular-core';
import { environment } from 'src/environments/environment';
import { File } from '../business/file';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor() { }

    public async CreateFile(name: string, text: string): Promise<string> {
        let url = environment.filesUri;
        let params = {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                Name: name,
                Text: text
            }),
            method: "POST"
        }

        var resp = await fetch(url, params);
        var result = await resp.json();
        return result.id;
    }

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

    public async updateFile(file: File): Promise<File> {

        let url = `${environment.filesUri}/${file.id}`;
        let params = {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            method: "PUT",
            body: JSON.stringify({
                canShare: file.canShare,
                name: file.name,
                text: file.text
            })
        }

        var resp = await fetch(url, params);
        return resp.json();
    }
}