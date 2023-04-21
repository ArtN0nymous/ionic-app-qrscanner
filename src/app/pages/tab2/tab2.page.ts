import { Component, ViewChild } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { DataLocalService } from '../../services/data-local.service';
import { Registro } from '../../models/registro.model';
import { CommonModule } from '@angular/common';
import {toDataURL} from 'qrcode';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent,CommonModule,PipesModule,
    FormsModule]
})
export class Tab2Page {
  escaneos:Registro[]=[];
  generated!:string;
  textoBuscar:string='';
  canva = document.getElementById('canvas')as HTMLCanvasElement;;
  constructor(private dataLocal:DataLocalService,private toast:ToastController,private alertController:AlertController,private router:Router) {
    dataLocal.cargarEscaneos().then((result)=>{
      this.escaneos=result;
    });
  }
  sendEmail(){
    this.dataLocal.enviarCorreo();
  }
  abrir(scan:any){
    this.dataLocal.abrir(scan);
  }
  async generarqr(text:string) {
    let path= '';
    toDataURL(this.canva,text,{type:'image/jpeg'}, function (err, url) {
      path=url;
    });
    if(path!==undefined){
      this.generated=path;
      const toast = await this.toast.create({
        message: 'Toca para cerrar !',
        duration: 3000,
      });
  
      await toast.present();
  
      const { data } = await toast.onDidDismiss();
    }
    //console.log(data);
    /*this.socialSharing.share(
      'base64',
      'base64',
      undefined,
      path
    );*/
  }
  displayQrCode() {
    return this.generated !== ''?true:false;
  }
  compartir(scan:any){
    this.dataLocal.compartir(scan);
  }
  async abrirMapa(){
    const alert = await this.alertController.create({
      header: 'Ubicar coordenadas.',
      translucent:false,
      mode:'ios',
      buttons: [{
          text: 'Encontrar !',
          role: 'confirm',
          handler: (data) => {
            this.Mapa('geo:'+data.lat+','+data.long);
          },
      }],
      inputs: [
        {
          name:'lat',
          type:'number',
          placeholder: 'lat 40.7135',
        },
        {
          name:'long',
          type:'number',
          placeholder:'long -74.0066',
        }
      ],
    });
    await alert.present();
  }
  Mapa(text:string){
    const navigationExatras:NavigationExtras={
      queryParams:{
        data:text
      }
    }
    this.router.navigate([`/tabs/maps/`],navigationExatras);
  }
  onClick(){
    this.generated='';
  }
  async addQr() {
    const alert = await this.alertController.create({
      header: 'Genera un QR.',
      translucent:false,
      mode:'ios',
      buttons: [{
          text: 'Generar !',
          role: 'confirm',
          handler: (data) => {
            this.generarqr(data.texto);
          },
      }],
      inputs: [
        {
          name:'texto',
          min:1,
          placeholder: 'https://example.com/',
        },
      ],
    });
    await alert.present();
  }
  buscar(ev:any){
    this.textoBuscar=ev.detail.value;
  }
}
