import { Injectable, signal, Signal } from '@angular/core';

export interface Notification {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private readonly notificationsSignal = signal<Notification[]>([]);
    readonly notifications: Signal<Notification[]> = this.notificationsSignal.asReadonly();
    private nextId = 1;

    success(message: string): void {
        this.notify('success', message);
    }

    error(message: string): void {
        this.notify('error', message);
    }

    info(message: string): void {
        this.notify('info', message);
    }

    dismiss(id: number): void {
        this.notificationsSignal.update((list) => list.filter((notification) => notification.id !== id));
    }

    private notify(type: Notification['type'], message: string): void {
        const id = this.nextId++;
        this.notificationsSignal.update((list) => [...list, { id, type, message }]);
        setTimeout(() => this.dismiss(id), 5000);
    }
}
