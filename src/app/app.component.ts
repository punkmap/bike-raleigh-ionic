import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav, Platform, Tabs } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { FeaturesProvider } from '../providers/features/features';
import { Network } from '../../node_modules/@ionic-native/network';
import { Subscription } from '../../node_modules/rxjs';
import { AlertController } from 'ionic-angular';

import { ModalController } from 'ionic-angular';
import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
import { Storage } from '../../node_modules/@ionic/storage';


@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('tabs') tabRef: Tabs;
  title:string = '';
  layersRoot = 'LayersPage'
  nearbyRoot = 'NearbyPage'
  basemapsRoot = 'BasemapsPage'
  shops:any[] = [];
  parking:any[] = [];
  greenways:any[] = [];
  rootPage: any = HomePage;
  arcgisLoaded:boolean = false;
  layersQueried:boolean = false;
  pages: Array<{title: string, component: any}>;

  disconnectSubscription:Subscription;
  connectSubscription:Subscription;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public features:FeaturesProvider, private network:Network, public alertCtrl: AlertController, public modalCtrl: ModalController, private storage: Storage) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.storage.get('disclaimer').then(disclaimer => {
        if (!disclaimer) {
          this.presentModal();
        } else if (!disclaimer.hide) {
          this.presentModal();
        }
      });
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkConnection();
    });
  }
  presentModal() {
      const modal = this.modalCtrl.create(DisclaimerPage);
      modal.present();

  }

  tabChanged(event) {
    this.title = event.tabTitle;
    if (this.title === 'Nearby' && !this.layersQueried) {
      this.features.setNearbySelected(true);
      this.layersQueried = true;
    }
  }

  checkConnectionType () {
    this.features.connected.next(this.network.type != 'none' && this.network.type != 'unknown' && this.network.type != '2g');
    if (this.network.type === 'none' || this.network.type === 'unknown' || this.network.type === '2g') {
      this.sendConnectionAlert();
    }
  }

  sendConnectionAlert() {
    const alert = this.alertCtrl.create({
      title: 'No Internet Connection',
      subTitle: 'BikeRaleigh requires an internet connection',
      buttons: ['OK']
    });
    alert.present();
  }

  checkConnection () {
    this.checkConnectionType();

    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.sendConnectionAlert();
    });
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      this.checkConnectionType();
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });
  }
  ionViewWillLeave() { 
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();

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
    });
    this.features.arcgisLoaded.subscribe(loaded => {
      this.arcgisLoaded = loaded;
      this.splashScreen.hide();
    });  
    window.setTimeout(8000, () => {
      this.splashScreen.hide();
    });
  }
  
}
