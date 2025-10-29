import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {
  quickActions: QuickAction[] = [
    {
      label: 'Nuevo Producto',
      icon: 'fas fa-plus',
      route: '/products/create',
      color: 'primary',
      description: 'Agregar un nuevo producto al catálogo'
    },
    {
      label: 'Nuevo Usuario',
      icon: 'fas fa-user-plus',
      route: '/users/create',
      color: 'success',
      description: 'Registrar un nuevo usuario'
    },
    {
      label: 'Nuevo Pedido',
      icon: 'fas fa-shopping-cart',
      route: '/orders/create',
      color: 'warning',
      description: 'Crear un nuevo pedido'
    },
    {
      label: 'Probar Conexión',
      icon: 'fas fa-wifi',
      route: '/products/test-connection',
      color: 'info',
      description: 'Verificar conectividad con el backend'
    }
  ];
}







