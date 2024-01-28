import { Component, OnInit } from '@angular/core';

import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from 'src/app/Interfaces/login';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formLogin:FormGroup;
  ocultarPassword:boolean=true;
  mostrarLoading:boolean=false;

  constructor(
    private fb:FormBuilder,
    private router:Router,
    private _usuarioService:UsuarioService,
    private _utilidadService:UtilidadService
  ) { 
    this.formLogin=this.fb.group({
      email:['',[Validators.required]],
      clave:['',[Validators.required]]
    });
  }
    


  ngOnInit(): void {
  }

  iniciarSesion(){
    this.mostrarLoading=true;

    const request:Login={
      email:this.formLogin.value.email,
      clave:this.formLogin.value.clave
    }
    this._usuarioService.iniciarSesion(request).subscribe({
      next:(data)=>{
        if(data.status){
          this._utilidadService.guardarSesionUsuario(data.value);
          this.router.navigate(['pages']);
        }else{
          this._utilidadService.mostrarAlerta('No se encontraron coincidencias',"Opps!");
        }
      },
      complete:()=>{
        this.mostrarLoading=false;
      },
      error:()=>{
        this._utilidadService.mostrarAlerta('Hubo un error',"Opps!");
      }
    })
  }
}
