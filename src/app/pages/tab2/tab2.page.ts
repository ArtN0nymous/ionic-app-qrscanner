import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { DataLocalService } from '../../services/data-local.service';
import { Registro } from '../../models/registro.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent,CommonModule]
})
export class Tab2Page {
  escaneos:Registro[]=[];
  constructor(private dataLocal:DataLocalService) {
    dataLocal.cargarEscaneos().then((result)=>{
      this.escaneos=result;
    });
  }
  sendEmail(){
    console.log('Send email');
  }

}
