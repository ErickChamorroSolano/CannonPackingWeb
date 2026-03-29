import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
    standalone: true,
    selector: 'app-notifications',
    imports: [CommonModule],
    templateUrl: './notifications.html',
    styleUrl: './notifications.css',
})
export class Notifications {
    constructor(public readonly notificationService: NotificationService) { }
}
