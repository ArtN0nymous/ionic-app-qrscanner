import { Injectable } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser'

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  guardado:Registro[]=[];
  _storage:Storage|null=null;
  constructor(private storage:Storage,private toastCtrl:ToastController,private navCtrl:NavController) {
    this.init();
    this.cargarEscaneos();
  }
  guardarScaneo(format:string,text:string){
    const nuevoScaneo = new Registro(format,text);
    const exist= this.guardado.find(scan=>scan.text===text);
    if(!exist){
      this.guardado.unshift(nuevoScaneo);
      console.log('GUARDADO',this.guardado);
      this.storage.set('escaneos',this.guardado);
      this.mostrarMensaje();
      this.navCtrl.navigateForward('/tabs/tab2');
      this.abrir(nuevoScaneo);
    }else{
      alert('Este escaneo ya existe');
    }
  }
  async mostrarMensaje(){
    const toast= await this.toastCtrl.create({
      message:'Escaneo guardado',
      duration:1500
    });
    toast.present();
  }
  async cargarEscaneos(){
    const escaneos = await this.storage.get('escaneos');
    this.guardado= escaneos||[];
    console.log('CARGADOS',escaneos);
    return escaneos;
  }
  async init(){
    const storage = await this.storage.create();
    this._storage = storage;
  }
  abrir(scan:Registro){
    switch (scan.type) {
      case 'http':
        InAppBrowser.create(scan.text);
        break;
    
      default:
        break;
    }
  }
}
