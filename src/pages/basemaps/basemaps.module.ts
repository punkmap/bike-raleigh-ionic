import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BasemapsPage } from './basemaps';

@NgModule({
  declarations: [
    BasemapsPage,
  ],
  imports: [
    IonicPageModule.forChild(BasemapsPage),
  ],
})
export class BasemapsPageModule {}
