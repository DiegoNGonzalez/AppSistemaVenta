import { Component, Inject, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Categoria } from 'src/app/Interfaces/categoria';
import { Producto } from 'src/app/Interfaces/producto';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';



@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css']
})
export class ModalProductoComponent implements OnInit {

  
  formProducto:FormGroup;
  tituloAccion:string="Agregar";
  botonAccion:string="Guardar";
  listaCategorias:Categoria[]=[];

  constructor(
    private modalActual:MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto:Producto,
    private fb:FormBuilder,
    private _categoriaService:CategoriaService,
    private _productoService:ProductoService,
    private _utilidadService:UtilidadService

  ) {
    this.formProducto=this.fb.group({
      nombreProducto:['',Validators.required],
      idCategoria:['',Validators.required],
      stock:['',Validators.required],
      precio:['',Validators.required],
      esActivo:[1,Validators.required]
    });

    if(this.datosProducto !=null){
      this.tituloAccion="Editar";
      this.botonAccion="Actualizar";
    }

    this._categoriaService.lista().subscribe({
      next:(response)=>{
        if(response.status)this.listaCategorias=response.value;
      },
      error:(error)=>{}
    });
   }

  ngOnInit(): void {
      
      if(this.datosProducto !=null){
        this.formProducto.patchValue({
          nombreProducto:this.datosProducto.nombreProducto,
          idCategoria:this.datosProducto.idCategoria,
          stock:this.datosProducto.stock,
          precio:this.datosProducto.precio,
          esActivo:this.datosProducto.esActivo
        });
      }
  }

  guardarEditar_Producto(){

    const _producto: Producto ={
      idProducto:this.datosProducto==null?0:this.datosProducto.idProducto,
      nombreProducto:this.formProducto.value.nombreProducto,
      idCategoria:this.formProducto.value.idCategoria,
      descripcionCategoria:"",
      precio:this.formProducto.value.precio,
      stock:this.formProducto.value.stock,
      esActivo:parseInt(this.formProducto.value.esActivo)
    };

    if(this.datosProducto==null){
      this._productoService.guardar(_producto).subscribe({
        next:(response)=>{
          if(response.status){
            this._utilidadService.mostrarAlerta("El producto fue registrado","Exito");
            this.modalActual.close("true");
          }else{
            this._utilidadService.mostrarAlerta("No se pudo registrar el producto","Error");
          }
        },
        error:(error)=>{}
      });

    }else{
      this._productoService.editar(_producto).subscribe({
        next:(response)=>{
          if(response.status){
            this._utilidadService.mostrarAlerta("El producto fue editado","Exito");
            this.modalActual.close("true");
          }else{
            this._utilidadService.mostrarAlerta("No se pudo editar el producto","Error");
          }
        },
        error:(error)=>{}
      });
    }
  }

}
