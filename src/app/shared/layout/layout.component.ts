import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, BreadcrumbsComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
