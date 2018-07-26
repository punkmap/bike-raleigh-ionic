import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LayersPage } from './layers';

@NgModule({
  declarations: [
    LayersPage,
  ],
  imports: [
    IonicPageModule.forChild(LayersPage),
  ],
})
export class LayersPageModule {}
