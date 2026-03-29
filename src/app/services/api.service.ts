import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

export interface Item {
    id: number;
    itemCode: string;
    productCode: string;
    status: string;
    boxId?: number;
    boxCode?: string;
    isActive: boolean;
}

export interface Box {
    id: number;
    boxCode: string;
    productCode: string;
    capacity: number;
    status: string;
    isActive: boolean;
}

export interface PackingRequest {
    boxId: number;
    itemId: number;
    quantity: number;
}

export interface PackingResult {
    id: number;
    boxId: number;
    itemId: number;
    quantity: number;
    createdAt: string;
}

export interface NewItem {
    itemCode: string;
    productCode: string;
}

export interface ApiResponse {
    message?: string;
    success?: string;
    error?: string;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    // se debe correr el proyecto con "npm start" para que funcione las llamadas a la API.
    private readonly baseUrl = '/api';

    constructor(private readonly http: HttpClient) { }

    // ITEMS
    getItems(): Observable<Item[]> {
        return this.http
            .get<Item[]>(`${this.baseUrl}/Towel`)
            .pipe(catchError(() => of([])));
    }

    createItem(myNewItem: NewItem): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/Towel`, myNewItem, {
            responseType: 'text' as 'json'
        });
    }

    disableItem(itemId: number): Observable<string> {
        return this.http.put<string>(`${this.baseUrl}/Towel/${itemId}/disable`, null, {
            responseType: 'text' as 'json'
        });
    }

    // BOXES
    getBoxes(): Observable<Box[]> {
        return this.http
            .get<Box[]>(`${this.baseUrl}/Box`)
            .pipe(catchError(() => of([])));
    }

    // PACKING
    createPacking(payload: PackingRequest): Observable<PackingResult> {
        return this.http.post<PackingResult>(`${this.baseUrl}/Packing`, payload);
    }
}
