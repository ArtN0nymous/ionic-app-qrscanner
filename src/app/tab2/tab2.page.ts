import { Component, ViewChild } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { DataLocalService } from '../services/data-local.service';
import { Record } from '../models/record.model';
import { CommonModule } from '@angular/common';
import { toDataURL } from 'qrcode';
import { FilterPipe } from '../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FilterPipe, FormsModule]
})
export class Tab2Page {
  scans: Record[] = [];
  generated: string = '';
  searchText: string = '';
  canvas = document.getElementById('canvas') as HTMLCanvasElement;

  constructor(
    private dataLocal: DataLocalService,
    private toast: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    dataLocal.loadScans().then((result) => {
      this.scans = result;
    });
  }

  sendEmail(): void {
    this.dataLocal.sendEmail();
  }

  open(scan: any): void {
    this.dataLocal.open(scan);
  }

  async generateQR(text: string): Promise<void> {
    let path = '';
    toDataURL(this.canvas, text, { type: 'image/jpeg' }, function (err, url) {
      path = url;
    });
    if (path !== undefined) {
      this.generated = path;
      const toast = await this.toast.create({
        message: 'Tap to close!',
        duration: 3000,
      });

      await toast.present();

      const { data } = await toast.onDidDismiss();
    }
  }

  displayQrCode(): boolean {
    return this.generated !== '' ? true : false;
  }

  share(scan: any): void {
    this.dataLocal.share(scan);
  }


  onClick(): void {
    this.generated = '';
  }

  async addQr(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Generate a QR.',
      translucent: false,
      mode: 'ios',
      buttons: [{
        text: 'Generate!',
        role: 'confirm',
        handler: (data) => {
          this.generateQR(data.texto);
        },
      }],
      inputs: [
        {
          name: 'texto',
          min: 1,
          placeholder: 'https://example.com/',
        },
      ],
    });
    await alert.present();
  }

  search(ev: any): void {
    this.searchText = ev.detail.value;
  }
}