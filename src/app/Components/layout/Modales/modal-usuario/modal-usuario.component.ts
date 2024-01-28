import { Component, Inject, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from 'src/app/Interfaces/rol';
import { Usuario } from 'src/app/Interfaces/usuario';

import { RolService } from 'src/app/Services/rol.service';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit {


  formUsuario:FormGroup;
  ocultarPassword:boolean=true;
  tituloAccion:string="Agregar";
  botonAccion:string="Guardar";
  listaRoles:Rol[]=[];


  constructor(
    private modalActual:MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario:Usuario,
    private fb:FormBuilder,
    private _rolService:RolService,
    private _usuarioService:UsuarioService,
    private _utilidadService:UtilidadService

  ) {
    this.formUsuario=this.fb.group({
      nombreApellido:['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      idRol:['',Validators.required],
      clave:['',Validators.required],
      esActivo:[1,Validators.required]
    });

    if(this.datosUsuario !=null){
      this.tituloAccion="Editar";
      this.botonAccion="Actualizar";
    }

    this._rolService.lista().subscribe({
      next:(response)=>{
        if(response.status)this.listaRoles=response.value;
      },
      error:(error)=>{}
    });

   }

  ngOnInit(): void {

    if(this.datosUsuario !=null){
      this.formUsuario.patchValue({
        nombreApellido:this.datosUsuario.nombreApellido,
        email:this.datosUsuario.email,
        idRol:this.datosUsuario.idRol,
        clave:this.datosUsuario.clave,
        esActivo:this.datosUsuario.esActivo.toString()
      });
    }

  }

  guardarEditar_Usuario(){

    const _usuario: Usuario ={
      idUsuario:this.datosUsuario==null?0:this.datosUsuario.idUsuario,
      nombreApellido:this.formUsuario.value.nombreApellido,
      email:this.formUsuario.value.email,
      idRol:this.formUsuario.value.idRol,
      rolDescripcion:"",
      clave:this.formUsuario.value.clave,
      esActivo:parseInt(this.formUsuario.value.esActivo)
    };

    if(this.datosUsuario==null){
      this._usuarioService.guardar(_usuario).subscribe({
        next:(response)=>{
          if(response.status){
            this._utilidadService.mostrarAlerta("El usuario fue registrado","Exito");
            this.modalActual.close("true");
          }else{
            this._utilidadService.mostrarAlerta("No se pudo registrar el usuario","Error");
          }
        },
        error:(error)=>{}
      });

    }else{
      this._usuarioService.editar(_usuario).subscribe({
        next:(response)=>{
          if(response.status){
            this._utilidadService.mostrarAlerta("El usuario fue editado","Exito");
            this.modalActual.close("true");
          }else{
            this._utilidadService.mostrarAlerta("No se pudo editar el usuario","Error");
          }
        },
        error:(error)=>{}
      });
    }
  }

}
