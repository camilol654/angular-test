import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, QuickActionsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;
  submenuOpen: string | null = null;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.submenuOpen = null;
    }
  }

  toggleSubmenu(menu: string): void {
    if (this.isCollapsed) return;
    
    this.submenuOpen = this.submenuOpen === menu ? null : menu;
  }

  // Método para determinar si una ruta está activa (para el menú principal)
  isActiveRoute(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }
}
