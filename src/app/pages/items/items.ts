import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { ApiService, Item } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    standalone: true,
    selector: 'app-items',
    imports: [CommonModule, FormsModule],
    templateUrl: './items.html',
    styleUrl: './items.css',
})
export class Items {
    @ViewChild('newItemCodeInput') newItemCodeInput?: ElementRef<HTMLInputElement>;

    items$!: Observable<Item[]>;
    itemToDisable: Item | null = null;
    isDeleting = false;

    showCreateDialog = false;
    newItemCode = '';
    newProductCode = '';
    isCreating = false;
    createFormError = '';

    constructor(
        @Inject(ApiService) private readonly api: ApiService,
        private readonly notifications: NotificationService
    ) {
        this.loadItems();
    }

    loadItems(): void {
        this.items$ = this.api.getItems();
    }

    openCreateDialog(): void {
        this.showCreateDialog = true;
        this.newItemCode = '';
        this.newProductCode = '';
        this.createFormError = '';

        setTimeout(() => {
            this.newItemCodeInput?.nativeElement.focus();
        }, 0);
    }

    closeCreateDialog(): void {
        this.showCreateDialog = false;
        this.isCreating = false;
        this.createFormError = '';
    }

    submitCreateForm(event: Event): void {
        event.preventDefault();
        this.createItem();
    }

    createItem(): void {
        const itemCode = this.newItemCode.trim();
        const productCode = this.newProductCode.trim();

        if (!itemCode && !productCode) {
            this.createFormError = 'Ambos campos son requeridos.';
            return;
        }

        if (!itemCode) {
            this.createFormError = 'ITEM CODE es requerido.';
            return;
        }

        if (!productCode) {
            this.createFormError = 'PRODUCT CODE es requerido.';
            return;
        }

        if (itemCode.length > 20 || productCode.length > 20) {
            this.createFormError = 'Los campos no pueden tener más de 20 caracteres.';
            return;
        }

        this.createFormError = '';
        this.isCreating = true;

        this.api.createItem({ itemCode, productCode })
            .pipe(finalize(() => {
                this.isCreating = false;
            }))
            .subscribe({
                next: (response) => {
                    const successMessage = response || `Item ha sido creado correctamente.`;
                    this.notifications.success(successMessage);
                    this.loadItems();
                    this.closeCreateDialog();
                },
                error: (e) => {
                    const backendError = e?.error?.message || e?.error || e?.message || 'Error al crear el item. Intenta de nuevo.';
                    this.notifications.error(backendError);
                },
            });
    }

    @HostListener('window:keydown.escape', ['$event'])
    handleEscape(event: Event): void {
        if (this.showCreateDialog || this.itemToDisable) {
            this.closeActiveDialog();
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.preventDefault) {
                keyboardEvent.preventDefault();
            }
        }
    }

    closeActiveDialog(): void {
        if (this.showCreateDialog) {
            this.closeCreateDialog();
            return;
        }

        if (this.itemToDisable) {
            this.cancelDelete();
        }
    }

    confirmDelete(item: Item): void {
        this.itemToDisable = item;
    }

    cancelDelete(): void {
        this.itemToDisable = null;
    }

    disableItem(): void {
        if (!this.itemToDisable) {
            return;
        }

        const itemId = this.itemToDisable.id;
        this.itemToDisable = null;
        this.isDeleting = true;

        this.api.disableItem(itemId)
            .pipe(finalize(() => {
                this.isDeleting = false;
                this.itemToDisable = null;
            }))
            .subscribe({
                next: (response) => {
                    const successMessage = response || 'Item ha sido eliminado correctamente.';
                    this.notifications.success(successMessage);
                    //console.log('Item eliminado:', itemId, response);
                    this.loadItems();
                },
                error: (e) => {
                    const message = e?.error || 'Error al eliminar el item. Intenta de nuevo.';
                    this.notifications.error(message);
                    //console.log('Error al eliminar item:', itemId, e);
                },
            });
    }
}
