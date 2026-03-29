import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, Box, Item, PackingRequest } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-boxes',
  imports: [CommonModule, FormsModule],
  templateUrl: './boxes.html',
  styleUrl: './boxes.css',
})
export class Boxes {
  boxes$!: Observable<Box[]>;
  items$!: Observable<Item[]>;
  showPackingPopup = false;
  selectedBox = '';
  selectedItem = '';
  quantity = 1;

  constructor(
    @Inject(ApiService) private readonly api: ApiService,
    private readonly notifications: NotificationService
  ) {
    this.boxes$ = this.api.getBoxes();
    this.items$ = this.api.getItems();
  }

  openPackingPopup(): void {
    this.showPackingPopup = true;
  }

  closePackingPopup(): void {
    this.showPackingPopup = false;
    this.selectedBox = '';
    this.selectedItem = '';
    this.quantity = 1;
  }

  createPacking(): void {
    if (!this.selectedBox || !this.selectedItem || this.quantity < 1) {
      this.notifications.error('Selecciona una caja, un item y una cantidad válida.');
      return;
    }

    const payload: PackingRequest = {
      boxId: Number(this.selectedBox),
      itemId: Number(this.selectedItem),
      quantity: this.quantity,
    };

    this.api.createPacking(payload).subscribe({
      next: () => {
        this.notifications.success('Empaque creado con éxito.');
        this.closePackingPopup();
      },
      error: () => {
        this.notifications.error('No se pudo crear el empaque. Revisa la API.');
      },
    });
  }
}