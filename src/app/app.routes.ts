import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Items } from './pages/items/items';
import { Boxes } from './pages/boxes/boxes';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'items', component: Items },
    { path: 'boxes', component: Boxes },
    { path: '**', redirectTo: '' }
];
