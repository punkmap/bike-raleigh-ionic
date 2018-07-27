import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FeaturesProvider } from '../../providers/features/features';

/**
 * Generated class for the LayersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-layers',
  templateUrl: 'layers.html',
})
export class LayersPage implements OnInit{
  @ViewChild('layers') layersEl: ElementRef;

  constructor(public navCtrl: NavController, public navParams: NavParams, public features:FeaturesProvider) {
  }

  ionViewDidLoad () {
    this.features.arcgisLoaded.subscribe(loaded => {
      if (loaded) {
        this.features.setLayerEl(this.layersEl);
      }
    })
  }

  

  ngOnInit() {
    
  }
}
