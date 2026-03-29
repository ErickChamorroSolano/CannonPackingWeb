import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { ApiService, Box, Item, NewBox, PackingRequest } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-boxes',
  imports: [CommonModule, FormsModule],
  templateUrl: './boxes.html',
  styleUrl: './boxes.css',
})
export class Boxes {
  @ViewChild('newBoxCodeInput') newBoxCodeInput?: ElementRef<HTMLInputElement>;

  boxes$!: Observable<Box[]>;
  showPackingPopup = false;
  selectedBox = '';
  selectedItem = '';
  quantity = 1;

  showCreateBoxDialog = false;
  newBoxCode = '';
  newProductCode = '';
  newBoxCapacity = '';
  createBoxFormError = '';
  isCreatingBox = false;

  showBoxDetailsPopup = false;
  showBoxDeleteDialog = false;
  selectedBoxForDetails: Box | null = null;
  availableItems: Item[] = [];
  selectedAvailableItem = '';
  packItemError = '';
  isPackingItem = false;
  boxToDelete: Box | null = null;
  isDeletingBox = false;

  constructor(
    @Inject(ApiService) private readonly api: ApiService,
    private readonly notifications: NotificationService
  ) {
    this.boxes$ = this.api.getBoxes();
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

  openCreateBoxDialog(): void {
    this.showCreateBoxDialog = true;
    this.newBoxCode = '';
    this.newProductCode = '';
    this.newBoxCapacity = '';
    this.createBoxFormError = '';

    setTimeout(() => {
      this.newBoxCodeInput?.nativeElement.focus();
    }, 0);
  }

  closeCreateBoxDialog(): void {
    this.showCreateBoxDialog = false;
    this.isCreatingBox = false;
    this.createBoxFormError = '';
  }

  submitCreateBoxForm(event: Event): void {
    event.preventDefault();
    this.createBox();
  }

  createBox(): void {
    const boxCode = this.newBoxCode.trim();
    const productCode = this.newProductCode.trim();
    const capacityText = this.newBoxCapacity.trim();

    if (!boxCode && !productCode && !capacityText) {
      this.createBoxFormError = 'Todos los campos son requeridos.';
      return;
    }

    if (!boxCode) {
      this.createBoxFormError = 'Código es requerido.';
      return;
    }

    if (!productCode) {
      this.createBoxFormError = 'Producto es requerido.';
      return;
    }

    if (!capacityText) {
      this.createBoxFormError = 'Capacidad es requerido.';
      return;
    }

    if (boxCode.length > 20 || productCode.length > 20) {
      this.createBoxFormError = 'Los campos no pueden tener más de 20 caracteres.';
      return;
    }

    if (!/^[0-9]{1,3}$/.test(capacityText)) {
      this.createBoxFormError = 'Capacidad debe ser un número entero de hasta 3 dígitos.';
      return;
    }

    const capacity = Number(capacityText);
    if (capacity < 1 || capacity > 999) {
      this.createBoxFormError = 'Capacidad debe estar entre 1 y 999.';
      return;
    }

    this.createBoxFormError = '';
    this.isCreatingBox = true;

    const payload: NewBox = {
      boxCode,
      productCode,
      capacity,
    };

    this.api.createBox(payload)
      .pipe(finalize(() => {
        this.isCreatingBox = false;
      }))
      .subscribe({
        next: (response) => {
          this.notifications.success(response || 'Caja creada correctamente.');
          this.loadBoxes();
          this.closeCreateBoxDialog();
        },
        error: (e) => {
          const backendError = e || 'Error al crear la caja. Intenta de nuevo.';
          this.notifications.error(backendError);
        },
      });
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

  openBoxDetails(box: Box): void {
    this.selectedBoxForDetails = box;
    this.selectedAvailableItem = '';
    this.packItemError = '';
    this.showBoxDetailsPopup = true;
    this.loadAvailableItems(box.productCode);
  }

  loadAvailableItems(productCode: string): void {
    this.api.getItemsByProductCode(productCode).subscribe({
      next: (items) => {
        this.availableItems = items;
      },
      error: (e) => {
        console.log(e);
        this.availableItems = [];
      },
    });
  }

  get isSelectedBoxOpen(): boolean {
    return this.selectedBoxForDetails?.status === 'OPEN';
  }

  toggleBoxState(): void {
    if (!this.selectedBoxForDetails) {
      return;
    }

    if (this.selectedBoxForDetails.status === 'OPEN') {
      this.selectedBoxForDetails = {
        ...this.selectedBoxForDetails,
        status: 'CLOSE',
      };
      this.closeBoxDetails();
      return;
    }

    this.selectedBoxForDetails = {
      ...this.selectedBoxForDetails,
      status: 'OPEN',
    };

    this.loadAvailableItems(this.selectedBoxForDetails.productCode);
  }

  addItemToBox(event: Event): void {
    event.preventDefault();
    const currentBox = this.selectedBoxForDetails;
    if (!currentBox) {
      return;
    }

    if (!this.selectedAvailableItem) {
      this.packItemError = 'Selecciona un item para agregar.';
      return;
    }

    const itemId = Number(this.selectedAvailableItem);
    if (!itemId || Number.isNaN(itemId)) {
      this.packItemError = 'Selecciona un item válido.';
      return;
    }

    const selectedItem = this.availableItems.find((item) => item.id === itemId);
    if (!selectedItem) {
      this.packItemError = 'Item no encontrado.';
      return;
    }

    this.packItemError = '';
    this.isPackingItem = true;

    this.api.packItem(currentBox.id, itemId).pipe(finalize(() => {
      this.isPackingItem = false;
    })).subscribe({
      next: (response) => {
        this.notifications.success(response || `Item ${selectedItem.itemCode} agregado a la caja.`);
        this.selectedBoxForDetails = {
          ...currentBox,
          towels: [...(currentBox.towels ?? []), selectedItem],
        };
        this.availableItems = this.availableItems.filter((item) => item.id !== itemId);
        this.selectedAvailableItem = '';
        this.loadBoxes();
      },
      error: (e) => {
        const backendError = e || 'No se pudo agregar el item. Intenta de nuevo.';
        this.notifications.error(backendError);
      },
    });
  }

  unpackItem(item: Item): void {
    const currentBox = this.selectedBoxForDetails;
    if (!currentBox) {
      return;
    }

    const payload = {
      boxId: currentBox.id,
      itemId: item.id,
    };

    this.api.unpackItem(payload).subscribe({
      next: (response) => {
        this.notifications.success(response || `Item ${item.itemCode} desasociado de la caja.`);
        this.selectedBoxForDetails = {
          ...currentBox,
          towels: currentBox.towels?.filter((t) => t.id !== item.id),
        };
        this.loadAvailableItems(currentBox.productCode);
        this.loadBoxes();
      },
      error: (e) => {
        const backendError = e || 'No se pudo desasociar el item. Intenta de nuevo.';
        this.notifications.error(backendError);
      },
    });
  }

  closeBoxDetails(): void {
    this.showBoxDetailsPopup = false;
    this.selectedBoxForDetails = null;
  }

  confirmDeleteBox(box: Box): void {
    this.boxToDelete = box;
    this.showBoxDeleteDialog = true;
  }

  cancelDeleteBox(): void {
    this.showBoxDeleteDialog = false;
    this.boxToDelete = null;
    this.isDeletingBox = false;
  }

  deleteBox(): void {
    if (!this.boxToDelete) {
      return;
    }

    this.isDeletingBox = true;

    const boxId = this.boxToDelete.id;
    this.api.disableBox(boxId)
      .pipe(finalize(() => {
        this.isDeletingBox = false;
      }))
      .subscribe({
        next: (response) => {
          this.notifications.success(response || 'Caja eliminada correctamente.');
          this.loadBoxes();
          this.cancelDeleteBox();
        },
        error: (e) => {
          this.notifications.error(e || 'Error al eliminar la caja. Intenta de nuevo.');
        },
      });
  }

  loadBoxes(): void {
    this.boxes$ = this.api.getBoxes();
  }
}