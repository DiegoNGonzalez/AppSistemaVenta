import { Component, OnInit,AfterViewInit,ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Usuario } from 'src/app/Interfaces/usuario';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit,AfterViewInit {

  columnasTabla: string[]=['nombreApellido','email','rolDescripcion','estado','acciones'];
  dataInicio:Usuario[]=[];
  dataListaUsuarios= new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!:MatPaginator;


  constructor(
    private dialog:MatDialog,
    private _usuarioService:UsuarioService,
    private _utilidadService:UtilidadService
  ) { }

    obtenerUsuarios(){
      this._usuarioService.lista().subscribe({
        next:(response)=>{
          if(response.status)this.dataListaUsuarios.data=response.value;
          else this._utilidadService.mostrarAlerta("No se encontraron usuarios","Oops!");
        },
        error:(error)=>{}
      });
    }

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataListaUsuarios.paginator=this.paginacionTabla;
  }

  aplicarFiltroTabla(event:Event){
    const filterValue=(event.target as HTMLInputElement).value;
    this.dataListaUsuarios.filter=filterValue.trim().toLowerCase();
  }

  nuevoUsuario(){
    this.dialog.open(ModalUsuarioComponent,{
      disableClose:true,
    }).afterClosed().subscribe(resultado=>{
      if(resultado ==="true")this.obtenerUsuarios();
    });
  }

  
  editarUsuario(usuario: Usuario){
    this.dialog.open(ModalUsuarioComponent,{
      disableClose:true,
      data:usuario
    }).afterClosed().subscribe(resultado=>{
      if(resultado ==="true")this.obtenerUsuarios();
    });
  }

  eliminarUsuario(usuario:Usuario){
    Swal.fire({
      title:"¿Desea eliminar el usuario?",
      text:usuario.nombreApellido,
      icon:"warning",
      confirmButtonColor:'#3085d6',
      confirmButtonText:'Si, eliminar',
      showCancelButton:true,
      cancelButtonColor:'#d33',
      cancelButtonText:'No, volver'     
    }).then((resultado)=>{
      if(resultado.isConfirmed){
        this._usuarioService.eliminar(usuario.idUsuario).subscribe({
          next:(response)=>{
            if(response.status){
              this._utilidadService.mostrarAlerta("El usuario fue eliminado","Listo!");
              this.obtenerUsuarios();
            }else{
              this._utilidadService.mostrarAlerta("No se pudo eliminar el usuario","Oops!");
            }
          },
          error:(error)=>{}
        });
      }
    })
  };

}
