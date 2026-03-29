import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-home',
    imports: [CommonModule, RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home { }
