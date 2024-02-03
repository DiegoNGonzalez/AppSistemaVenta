import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
//servicios
import { ProductoService } from 'src/app/Services/producto.service';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
//interfaces
import { Producto } from 'src/app/Interfaces/producto';
import { Venta } from 'src/app/Interfaces/venta';
import { DetalleVenta } from 'src/app/Interfaces/detalle-venta';
//alertas sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent implements OnInit {

  listaProductos: Producto[] = [];
  listaProductosFiltro: Producto[] = [];

  listraProductosVenta: DetalleVenta[] = [];
  blockBtnRegistrar: boolean = false;

  productoSeleccionado!: Producto;
  tipoDePagoDefecto: string = "Efectivo";
  totalPagar: number = 0;

  fomularioProdVenta: FormGroup;
  columnasTabla: string[] = ['producto', 'cantidad', 'precio', 'total', 'accion'];
  datosDetalleVenta = new MatTableDataSource(this.listraProductosVenta);

  productoFiltrado(busqueda: any): Producto[] {
    const valorBuscado = typeof (busqueda) === 'string' ? busqueda.toLowerCase() : busqueda.nombre.toLowerCase();

    return this.listaProductos.filter((producto) => producto.nombreProducto.toLowerCase().includes(valorBuscado));
  }

  constructor(
    private fb: FormBuilder,
    private _productoService: ProductoService,
    private _ventaService: VentaService,
    private _utilidadService: UtilidadService

  ) {
    this.fomularioProdVenta = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', Validators.required],
    });


    this._productoService.lista().subscribe({
      next: (response) => {
        if (response.status) {
          const lista = response.value as Producto[];
          this.listaProductos = lista.filter(p => p.esActivo == 1 && p.stock > 0);
        }
      },
      error: (error) => { }
    });

    this.fomularioProdVenta.get('producto')?.valueChanges.subscribe((value) => {
      this.listaProductosFiltro = this.productoFiltrado(value);
    });

  }

  ngOnInit(): void {
  }


  mostrarProducto(producto: Producto): string {
    return producto.nombreProducto;
  }

  productoParaVenta(event: any) {
    this.productoSeleccionado = event.option.value;
  }


  agregarProductoParaVenta() {

    const _cantidad: number = this.fomularioProdVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precio);
    const _total: number = _cantidad * _precio;
    this.totalPagar += _total;

    this.listraProductosVenta.push({
      idProducto: this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.nombreProducto,
      cantidad: _cantidad,
      precioTexto: String(_precio.toFixed(2)),
      totalTexto: String(_total.toFixed(2))
    });

    this.datosDetalleVenta = new MatTableDataSource(this.listraProductosVenta);

    this.fomularioProdVenta.patchValue({
      producto: '',
      cantidad: ''
    });

  }


  eliminarProductoParaVenta(detalle: DetalleVenta) {
    this.totalPagar = this.totalPagar - parseFloat(detalle.totalTexto);
    this.listraProductosVenta = this.listraProductosVenta.filter(p => p.idProducto !== detalle.idProducto);
    this.datosDetalleVenta = new MatTableDataSource(this.listraProductosVenta);
  }

  registrarVenta() {
    if (this.listraProductosVenta.length > 0) {
      this.blockBtnRegistrar = true;
      const venta: Venta = {
        tipoPago: this.tipoDePagoDefecto,
        totalTexto: String(this.totalPagar.toFixed(2)),
        detalleVenta: this.listraProductosVenta
      };

      this._ventaService.registrar(venta).subscribe({
        next: (response) => {
          if (response.status) {
            this.totalPagar = 0.00;
            this.listraProductosVenta = [];
            this.datosDetalleVenta = new MatTableDataSource(this.listraProductosVenta);


            Swal.fire({
              icon: 'success',
              title: 'Venta registrada!',
              text: `Numero de venta ${response.value.numeroDocumento}`
            });
          } else {
            this._utilidadService.mostrarAlerta("No se pudo registrar la venta", "Oops!");
            this.blockBtnRegistrar = false;
          }
        },
        complete: () => {
          this.blockBtnRegistrar = false;
        },
        error: (error) => { }
      });
    }

  }
}