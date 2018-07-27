import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '../../../node_modules/@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-disclaimer',
  templateUrl: 'disclaimer.html',
})
export class DisclaimerPage {
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public storage:Storage) {
  }
  dismiss() {
    this.storage.set('disclaimer', {hide: true});
    this.viewCtrl.dismiss();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad DisclaimerPage');
  }
}
