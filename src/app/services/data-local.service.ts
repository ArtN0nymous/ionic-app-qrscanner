import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Record } from '../models/record.model';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  savedRecords: Record[] = [];

  constructor(
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  saveScan(format: string, text: string): boolean {
    const newScan = new Record(format, text);
    const exist = this.savedRecords.find(scan => scan.text === text);
    
    if (!exist) {
      this.savedRecords.unshift(newScan);
      localStorage.setItem('scans', JSON.stringify(this.savedRecords));
      this.showMessage();
      return true;
    } else {
      alert('This scan already exists');
      return false;
    }
  }

  async showMessage(customMessage?: string): Promise<void> {
    const message = customMessage || 'Scan saved';
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1500
    });
    toast.present();
  }

  async loadScans(): Promise<Record[]> {
    if (this.savedRecords.length === 0) {
      const scans = localStorage.getItem('scans');
      this.savedRecords = scans ? JSON.parse(scans) : [];
    }
    return this.savedRecords;
  }

  open(scan: Record): void {
    const navigationExtras = {
      queryParams: {
        data: scan.text
      }
    };

    switch (scan.type) {
      case 'http':
        Browser.open({ url: scan.text });
        break;
      case 'geo':
        const coords = scan.text.replace('geo:', '').split(',');
        if (coords.length >= 2) {
          const lat = coords[0];
          const lng = coords[1];
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          Browser.open({ url: mapsUrl });
        }
        break;
      case 'gmap':
        Browser.open({ url: scan.text });
        break;
      case 'wifi':
        this.getNetworks(scan.text);
        break;
      case 'menu':
        Browser.open({ url: scan.text });
        break;
      default:
        this.share(scan);
        break;
    }
  }

  async openModal(scan: Record): Promise<void> {
    console.log('Open modal for:', scan);
  }

  async sendEmail(): Promise<void> {
    const arrTemp: string[] = [];
    const titles = 'Type,Format,Created,Text\n';
    arrTemp.push(titles);
    
    if (this.savedRecords.length > 0) {
      this.savedRecords.forEach(record => {
        const type = this.escapeCsvValue(record.type);
        const format = this.escapeCsvValue(record.format);
        const created = this.escapeCsvValue(record.created.toString());
        const text = this.escapeCsvValue(record.text);
        
        const line = `${type},${format},${created},${text}\n`;
        arrTemp.push(line);
      });
      
      const csvContent = arrTemp.join('');
      
      try {
        await this.createCSVFile(csvContent);
      } catch (error: any) {
        if (error && error.message && 
            (error.message.includes('cancelled') || 
             error.message.includes('canceled') ||
             error.message.includes('User cancelled') ||
             error.message.includes('User canceled'))) {
          return;
        }
        
        this.downloadCSV(csvContent);
      }
    } else {
      alert('If you want to share your scanner history in CSV format, you must first scan something.');
    }
  }

  private downloadCSV(csvContent: string): void {
    try {
      const fileName = `qrscanner-${new Date().toISOString().split('T')[0]}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showMessage('CSV file downloaded successfully!');
      } else {
        alert('CSV content ready for copy:\n\n' + csvContent.substring(0, 500) + '...');
      }
    } catch (error) {
      alert('Error downloading CSV file: ' + error);
    }
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  async createCSVFile(text: string): Promise<void> {
    try {
      const fileName = `qrscanner-${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = fileName;
      
      let directory = Directory.Documents;
      let fileUri;
      
      try {
        await Filesystem.writeFile({
          path: filePath,
          data: text,
          directory: directory,
          encoding: Encoding.UTF8,
        });

        fileUri = await Filesystem.getUri({
          directory: directory,
          path: fileName
        });
      } catch (docError) {
        directory = Directory.Cache;
        await Filesystem.writeFile({
          path: filePath,
          data: text,
          directory: directory,
          encoding: Encoding.UTF8,
        });

        fileUri = await Filesystem.getUri({
          directory: directory,
          path: fileName
        });
      }

      try {
        await Share.share({
          title: 'QR Scanner History',
          text: 'QR Scanner history export',
          url: fileUri.uri,
          dialogTitle: 'Share QR Scanner History'
        });
        
        this.showMessage('CSV file ready to share!');
      } catch (shareError: any) {
        if (shareError && shareError.message && 
            (shareError.message.includes('cancelled') || 
             shareError.message.includes('canceled') ||
             shareError.message.includes('User cancelled') ||
             shareError.message.includes('User canceled'))) {
          return;
        }
        throw shareError;
      }

    } catch (error) {
      alert('Error creating CSV file: ' + error);
    }
  }

  async share(scan: any): Promise<void> {
    let text = scan.text;
    
    if (scan.type === 'wifi') {
      let SSID, password, type;
      SSID = text.split('S:');
      SSID = SSID[1].split(';');
      SSID = SSID[0];

      password = text.split('P:');
      password = password[1].split(';');
      password = password[0];

      type = text.split('T:');
      type = type[1].split(';');
      type = type[0];
      
      text = 'Network: ' + SSID + ' Password:' + password;
      
      await Share.share({
        title: scan.type,
        text: text
      });
    } else {
      await Share.share({
        title: scan.type,
        text: scan.text
      });
    }
  }

  async getNetworks(text: string): Promise<void> {
    let SSID, password, type;
    let isHiddenSSID = false;
    
    SSID = text.split('S:');
    SSID = SSID[1].split(';');
    SSID = SSID[0];

    password = text.split('P:');
    password = password[1].split(';');
    password = password[0];

    type = text.split('T:');
    type = type[1].split(';');
    type = type[0];

    try {
      alert(`WiFi connection: ${SSID} - Password: ${password}`);
    } catch (error) {
      alert('Error connecting to WiFi network: ' + error);
    }
  }
}
