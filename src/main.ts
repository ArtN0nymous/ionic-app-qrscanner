import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PLATFORM_ID } from '@angular/core';
import { addIcons } from 'ionicons';
import { 
  barcode, 
  stop, 
  list, 
  map, 
  share, 
  grid, 
  add, 
  globe, 
  send,
  fastFood,
  logoGoogle,
  pin,
  wifi,
  document
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Register the icons
addIcons({
  barcode,
  stop,
  list,
  map,
  share,
  grid,
  add,
  globe,
  send,
  fastFood,
  logoGoogle,
  pin,
  wifi,
  document
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
