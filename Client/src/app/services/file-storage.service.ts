import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {

  public file: File | null = null;

  constructor() { }
}
