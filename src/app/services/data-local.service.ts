import { Injectable } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import {InAppBrowser} from '@awesome-cordova-plugins/in-app-browser'
import { MapsPage } from '../pages/maps/maps.page';
import { NavigationExtras, Router } from '@angular/router';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
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
    private router:Router,
    private file:File,
    private emailComposer:EmailComposer
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
    this.file.checkFile(this.file.dataDirectory,'registros.csv')
      .then(existe=>{
        console.log('existe archivo',existe);
        return this.escribirEnArchivo(text);
      }).catch(err=>{
        this.file.createFile(this.file.dataDirectory,'registros.csv',false)
          .then( creado =>this.escribirEnArchivo(text))
          .catch(err=>{
            console.log('No se pudo crear el archivo',err);
          })
      });
  }
  async escribirEnArchivo(text:string){
    await this.file.writeExistingFile(this.file.dataDirectory,'registro.csv',text );
    const archivo=  this.file.dataDirectory+'registro.csv';
    const email={
      to:'',
      //cc: '',
      //bcc:['email@ejemplo.com','email2@ejemplo.com'],
      attachments:[
        archivo
      ],
      subject: 'COM.RAMSUS.QRSCANNER',
      body: 'Send regristro',
      //isHTML:true
    };
    this.emailComposer.open(email);
  }
}
