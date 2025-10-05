import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataLocalService } from '../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab1Page {
  scanActive: boolean = false;

  constructor(
    private dataLocal: DataLocalService,
    private router: Router
  ) {}

  async startScanner(): Promise<void> {
    try {
      this.scanActive = true;
      
      // Start scanning with the correct API
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL
      });

      // Access the result using the correct property name
      const resultText = result.ScanResult;
      
      if (resultText) {
        this.scanActive = false;
        const saved = this.dataLocal.saveScan('QR_CODE', resultText);
        if (saved) {
          this.router.navigate(['/tabs/tab2']);
        }
      } else {
        alert('No data found in the scanned code');
      }
    } catch (error: any) {
      // Don't show error if user cancelled
      if (error && error.message && 
          (error.message.includes('cancelled') || 
           error.message.includes('canceled') ||
           error.message.includes('User cancelled') ||
           error.message.includes('User canceled'))) {
        // User cancelled - exit silently
        return;
      }
      
      // Show error for other cases
      alert('Scanner error: ' + error);
    } finally {
      this.scanActive = false;
    }
  }

  stopScanner(): void {
    this.scanActive = false;
  }

  ionViewWillLeave(): void {
    this.scanActive = false;
  }
}