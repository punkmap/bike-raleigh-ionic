import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FeaturesProvider } from '../../providers/features/features';
@IonicPage()
@Component({
  selector: 'page-basemaps',
  templateUrl: 'basemaps.html',
})
export class BasemapsPage {
  @ViewChild('basemaps') basemapsEl: ElementRef;
  constructor(public navCtrl: NavController, public navParams: NavParams, public features:FeaturesProvider) {
  }

  ionViewDidLoad() {
    this.features.arcgisLoaded.subscribe(loaded => {
      if (loaded) {
        this.features.setBasemapsEl(this.basemapsEl);
      }
    })    
  }

}
