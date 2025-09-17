import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTestService } from '../../../services/api-test.service';

@Component({
  selector: 'app-connection-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Prueba de Conexión con Backend</h4>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2 mb-3">
                <button class="btn btn-primary" (click)="testConnection()" [disabled]="testing">
                  <span *ngIf="testing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ testing ? 'Probando...' : 'Probar Conexión' }}
                </button>
                <button class="btn btn-outline-primary" (click)="testProductsEndpoint()" [disabled]="testing">
                  <span *ngIf="testing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ testing ? 'Probando...' : 'Probar Endpoint de Productos' }}
                </button>
              </div>

              <div *ngIf="result" class="alert" [ngClass]="result.connected || result.success ? 'alert-success' : 'alert-danger'">
                <h5>
                  <i class="fas" [ngClass]="result.connected || result.success ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
                  {{ result.connected || result.success ? 'Éxito' : 'Error' }}
                </h5>
                <p class="mb-0">{{ result.message }}</p>
                <div *ngIf="result.count !== undefined" class="mt-2">
                  <strong>Productos encontrados:</strong> {{ result.count }}
                </div>
              </div>

              <div *ngIf="!result && !testing" class="text-muted text-center">
                <i class="fas fa-info-circle fa-2x mb-2"></i>
                <p>Haga clic en los botones para probar la conexión con el backend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: none;
    }
    .btn {
      margin-bottom: 0.5rem;
    }
    .alert {
      border: none;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
  testing = false;
  result: any = null;

  constructor(private apiTestService: ApiTestService) {}

  ngOnInit(): void {}

  testConnection(): void {
    this.testing = true;
    this.result = null;

    this.apiTestService.testConnection().subscribe({
      next: (result) => {
        this.result = result;
        this.testing = false;
      },
      error: (error) => {
        this.result = {
          connected: false,
          message: `Error inesperado: ${error.message}`
        };
        this.testing = false;
      }
    });
  }

  testProductsEndpoint(): void {
    this.testing = true;
    this.result = null;

    this.apiTestService.testProductsEndpoint().subscribe({
      next: (result) => {
        this.result = result;
        this.testing = false;
      },
      error: (error) => {
        this.result = {
          success: false,
          count: 0,
          message: `Error inesperado: ${error.message}`
        };
        this.testing = false;
      }
    });
  }
}
