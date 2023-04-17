import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Registro } from '../../models/registro.model';
import { ActivatedRoute } from '@angular/router';
declare var mapboxgl:any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MapsPage implements OnInit, AfterViewInit{
  lat!:number;
  long!:number;
  constructor(private route:ActivatedRoute) { }

  ngOnInit() {
    let map:any = this.route.snapshot.queryParamMap.get('data');
    console.log(map);
    map=map.substring(4);
    map=map.split(',');
    this.lat=Number(map[0]);
    this.long=Number(map[1]);
    console.log(this.lat,this.long);
  }
  ngAfterViewInit(): void {
    mapboxgl.accessToken = 'pk.eyJ1IjoicmFtc3VzIiwiYSI6ImNsZ2R3eHFmOTEyYmUzZ256cGt2MDhzanAifQ.Cvj1IoUhcQOe7zP7UAcPPg';
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v11',
      center: [this.long||-74.0066, this.lat||40.7135],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });
    map.on('style.load', () => {
      map.resize();
      new mapboxgl.Marker()
        .setLngLat([this.long||-74.0066,this.lat||40.7135]).addTo(map);
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
      (layer:any) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;
    map.addLayer(
    {
      'id': 'add-3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height']
      ],
      'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height']
      ],
      'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
    );
  });
  }
}
