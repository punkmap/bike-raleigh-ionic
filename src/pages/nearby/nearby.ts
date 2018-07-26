import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FeaturesProvider } from '../../providers/features/features';

/**
 * Generated class for the NearbyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nearby',
  templateUrl: 'nearby.html',
})
export class NearbyPage implements OnInit {
  shops:any[] = [];
  parking:any[] = [];
  greenways:any[] = [];
  list = 'shops';
  constructor(public navCtrl: NavController, public navParams: NavParams, public features:FeaturesProvider) {
  }

  itemTapped(event, item) {
    this.features.zoomto.next(item);
  }

  ngOnInit() {
    this.features.shops.subscribe(features => {
      this.shops = features;
      
    })
    this.features.trailheads.subscribe(features => {
      this.greenways = features;
    })
    this.features.parking.subscribe(features => {
      this.parking = features;
    })      
  }

}
