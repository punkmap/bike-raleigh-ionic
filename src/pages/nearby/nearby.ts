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
      features.forEach(feature => {
        let label:string = feature.attributes.LABEL;
        if (label.indexOf('(') > -1) {
          feature.attributes.LABEL = label.substring(0, label.indexOf('('));
        }
      });
      this.shops = features;
      
    })
    this.features.trailheads.subscribe(features => {
      this.greenways = features;
    })
    this.features.parking.subscribe(features => {
      features.forEach(feature => {
        let address:string = feature.attributes.ADDRESS;
        if (address.indexOf(', R') > -1) {
          feature.attributes.ADDRESS = address.substring(0, address.indexOf(', R')).replace('Approx. ', '');
        }
      });
      this.parking = features;
    })      
  }

}
