import { User } from './user.interface';
import { Product } from './product.interface';

export interface OrderItem {
  productoId: number;
  producto: Product;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
}

export interface Order {
  id: number;
  fechaPedido: Date;
  usuarioId: number;
  usuario: User;
  items: OrderItem[];
  totalGeneral: number;
  estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}


