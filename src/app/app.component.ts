import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { Nav, Platform, Tabs } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { FeaturesProvider } from '../providers/features/features';
import { MenuPage } from '../pages/menu/menu';
import { Network } from '../../node_modules/@ionic-native/network';
import { Subscription } from '../../node_modules/rxjs';
import { AlertController } from 'ionic-angular';



@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('layers') layersEl: ElementRef;
  @ViewChild('tabs') tabRef: Tabs;
  title:string = '';
  layersRoot = 'LayersPage'
  nearbyRoot = 'NearbyPage'
  shops:any[] = [];
  parking:any[] = [];
  greenways:any[] = [];
  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  disconnectSubscription:Subscription;
  connectSubscription:Subscription;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public features:FeaturesProvider, private network:Network, public alertCtrl: AlertController) {
    this.initializeApp();
    
    this.statusBar.overlaysWebView(true);
    this.statusBar.backgroundColorByHexString("#ffffff");
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: MenuPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkConnection();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }


  tabChanged(event) {
    this.title = event.tabTitle;
  }

  checkConnectionType () {
    this.features.connected.next(this.network.type != 'none' && this.network.type != 'unknown' && this.network.type != '2g');
  }

  checkConnection () {
    this.checkConnectionType();

    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      const alert = this.alertCtrl.create({
        title: 'No Internet Connection',
        subTitle: 'BikeRaleigh requires and internet connection',
        buttons: ['OK']
      })
    });
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      this.checkConnectionType();
      // We just got a connection but we need to wait briefly
       // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.

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
    })        
  }
  
}
