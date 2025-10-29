import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css'
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  private routeLabels: { [key: string]: { label: string; icon: string } } = {
    'home': { label: 'Inicio', icon: 'fas fa-home' },
    'products': { label: 'Productos', icon: 'fas fa-box' },
    'products/create': { label: 'Crear Producto', icon: 'fas fa-plus' },
    'products/test-connection': { label: 'Probar Conexión', icon: 'fas fa-wifi' },
    'users': { label: 'Usuarios', icon: 'fas fa-users' },
    'users/create': { label: 'Crear Usuario', icon: 'fas fa-user-plus' },
    'orders': { label: 'Pedidos', icon: 'fas fa-shopping-cart' },
    'orders/create': { label: 'Crear Pedido', icon: 'fas fa-plus' },
    'admin': { label: 'Administración', icon: 'fas fa-cog' }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.generateBreadcrumbs(event.url);
      });
  }

  private generateBreadcrumbs(url: string): void {
    this.breadcrumbs = [];
    const segments = url.split('/').filter(segment => segment !== '');
    
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += '/' + segments[i];
      
      // Determinar si es un ID (número)
      const isId = /^\d+$/.test(segments[i]);
      
      if (isId) {
        // Para IDs, usar el segmento anterior + "Detalles"
        const parentSegment = segments[i - 1];
        const parentPath = currentPath.replace('/' + segments[i], '');
        
        this.breadcrumbs.push({
          label: 'Detalles',
          url: currentPath,
          icon: 'fas fa-eye'
        });
      } else if (segments[i] === 'edit') {
        // Para edición, usar el segmento anterior + "Editar"
        const parentSegment = segments[i - 1];
        const parentPath = currentPath.replace('/edit', '');
        
        this.breadcrumbs.push({
          label: 'Editar',
          url: currentPath,
          icon: 'fas fa-edit'
        });
      } else {
        // Para rutas normales
        const routeKey = currentPath.substring(1); // Remover el primer /
        const routeInfo = this.routeLabels[routeKey];
        
        if (routeInfo) {
          this.breadcrumbs.push({
            label: routeInfo.label,
            url: currentPath,
            icon: routeInfo.icon
          });
        } else {
          // Fallback para rutas no definidas
          this.breadcrumbs.push({
            label: this.capitalizeFirst(segments[i]),
            url: currentPath,
            icon: 'fas fa-file'
          });
        }
      }
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}







