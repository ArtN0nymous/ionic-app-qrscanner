import { Injectable } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser'
import { MapsPage } from '../pages/maps/maps.page';
import { NavigationExtras, Router } from '@angular/router';
import { File } from '@awesome-cordova-plugins/file/ngx';
@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  guardado:Registro[]=[];
  _storage:Storage|null=null;
  constructor(
    private storage:Storage,
    private toastCtrl:ToastController,
    private navCtrl:NavController,
    private modalCtrl:ModalController,
    private router:Router
  ) {
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
    const navigationExatras:NavigationExtras={
      queryParams:{
        data:scan.text
      }
    }
    switch (scan.type) {
      case 'http':
        InAppBrowser.create(scan.text);
        break;
      case 'geo':
        this.router.navigate([`/tabs/maps/`],navigationExatras);
        break;
      default:
        break;
    }
  }
  async abrirModal(scan:Registro){
    const modal = await this.modalCtrl.create({
      component: MapsPage,
      componentProps:{
        scan,
      }
    });
    modal.present();
  }
  enviarCorreo(){
    const arrTemp=[];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos);
    this.guardado.forEach(registro=>{
      const linea = `${registro.type},${registro.format},${registro.created},${registro.text.replace(',',' ')}\n`;
      arrTemp.push(linea);
    });
    //console.log(arrTemp.join(''));
    this.crearArchivoCSV(arrTemp.join(''));
  }
  crearArchivoCSV(text:string){
    
  }
}