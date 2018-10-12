import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import esri = __esri;
import { loadModules } from 'esri-loader';
import { loadCss } from 'esri-loader';
import { FeaturesProvider } from '../../providers/features/features';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('map') mapEl: ElementRef;
  @ViewChild('layers') layerEl: ElementRef;
  @ViewChild('basemaps') basemapsEl: ElementRef;
  view:esri.MapView = null;
  shops:esri.Graphic[] = [];
  parking:esri.Graphic[] =[];
  greenways:esri.Graphic[] = [];  
  layerList:esri.LayerList;
  basemapsGallery:esri.BasemapGallery;
  connected:boolean;
  arcgisLoaded:boolean = false;
  constructor(public navCtrl: NavController, public features:FeaturesProvider, public platform:Platform) {
  }
  async getGeo() {
    await this.platform.ready();
    loadCss('https://js.arcgis.com/4.8/esri/themes/dark/main.css');   
    const [WebMap, MapView]:any = await loadModules(['esri/WebMap', 'esri/views/MapView'])
    .catch(err => { console.error("ArcGIS: ", err)});
        let map: esri.WebMap = new WebMap({portalItem: {
          id: '618af88aa7fc419aaf713d4897a1679d'
        }});
        this.view = new MapView({
          container: this.mapEl.nativeElement,
          map: map
        });
        this.view.popup.dockEnabled = true;
        this.view.popup.dockOptions =  {
          position: 'bottom-center',
          buttonEnabled: false,
          breakpoint: false
        }; 
        this.view.when(() => {
          this.mapLoaded();
        });
  }
  mapLoaded() {
    this.features.zoomto.subscribe(feature =>
      {
     if (feature && this.view) {
       this.view.goTo(feature);
       this.view.popup.open({features:[feature]});
     }
   });       
    this.loadWidgets();
    let layer = this.view.map.basemap.baseLayers as any;
    layer.items[0].when((event) => {
      this.arcgisLoaded = true;
      this.features.setArcGisLoaded(true);
    });
    
    this.detectMapChange();    
    this.queryLayers();
  }
  queryLayers() {
    this.features.nearbySelected.subscribe((selected) => {
      if (selected) {
        loadModules(['esri/tasks/support/Query'])
        .then(([Query]) => {
          this.view.map.layers.forEach(layer => {
            let l = layer as esri.FeatureLayer;
            let query = new Query();
            query.where = "1=1";
            query.returnGeometry = true;
            query.outFields = '*';
            query.outSpatialReference = this.view.spatialReference;
            l.queryFeatures(query).then(results => {
              if (results.features.length > 0) {
                if (results.features[0].layer.title === 'Parking') {
                  this.sortByDistance(results.features, 'parking');
                }
                if (results.features[0].layer.title === 'Trailheads') {
                  this.sortByDistance(results.features, 'greenways');
                }       
                if (results.features[0].layer.title === 'Bike Shops') {
                  this.sortByDistance(results.features, 'shops');
    
                }                                                             
              }
            })
          });
        });
        this.features.nearbySelected.unsubscribe();
      }
    })
  }
  sortByDistance(dataset, layer) {
    loadModules(["esri/geometry/geometryEngine"])
    .then(([geometryEngine]) => {
      dataset.forEach(feature => {
        
        feature.attributes.distance = parseFloat(geometryEngine.distance(feature.geometry, this.view.center, 'miles').toFixed(2));
      });
      dataset.sort((a,b) => {
        return a.attributes.distance - b.attributes.distance;
      });
      if (layer == 'shops') {
        this.shops = dataset;
        this.features.setShops(dataset);          
      }
      if (layer == 'parking') {
        this.parking = dataset
        this.features.setParking(dataset);          
      }
      if (layer == 'greenways') {
        this.greenways = dataset;
        this.features.setTrailheads(dataset); 
      }
    });
  }
  detectMapChange() {
    loadModules(["esri/geometry/geometryEngine"])
    .then(([geometryEngine]) => {
      this.view.watch('stationary', stationary => {
        if (stationary) {
          this.sortByDistance(this.shops, 'shops');  
          this.sortByDistance(this.parking, 'parking');
          this.sortByDistance(this.greenways, 'greenways');  
        }
      });
    });
  }
  loadBaseMapGallery() {
    loadModules([
      "esri/widgets/BasemapGallery",
      "esri/Basemap",
      "esri/widgets/BasemapGallery/support/LocalBasemapsSource"
      ])
      .then(([BasemapGallery, Basemap, LocalBasemapsSource]) => { 
        let basemapIds = ['streets-navigation-vector', 'hybrid','streets-night-vector', 'gray-vector', 'dark-gray-vector', 'topo-vector', 'streets-vector'];
        let source:esri.LocalBasemapsSource = new LocalBasemapsSource({basemaps:[]})
        basemapIds.forEach(id => {
          source.basemaps.push(Basemap.fromId(id));
        });

        this.basemapsGallery = new BasemapGallery({view:this.view, source:source});
      });
      this.features.basemapsEl.subscribe(el => {
        if (el && this.basemapsGallery) {
          this.basemapsEl = el;
          this.basemapsGallery.container = el.nativeElement;
        }
      });          
  }

  loadWidgets() {
    loadModules([
      "esri/widgets/Track",
      "esri/widgets/LayerList",
      "esri/widgets/Compass"
      ])
      .then(([Track, LayerList, Compass]) => {   
        this.loadBaseMapGallery(); 
        let track = new Track({view: this.view});
        this.view.ui.add(track, 'top-left');

        let compass = new Compass({view: this.view});
        this.view.ui.add(compass, 'top-left');
        this.layerList = new LayerList({
          view: this.view,
          listItemCreatedFunction: function (event) {
            const item = event.item;
            item.panel = {
              content: "legend",
              open: true,
              visible: false
            };
          }              
        });
 
        this.features.layerEl.subscribe(el => {
          if (el && this.layerList) {
            this.layerEl = el;
            this.layerList.container = el.nativeElement;
            window.setTimeout(()=> {
             let items = Array.from(el.nativeElement.getElementsByClassName('esri-layer-list-panel__content--legend'));
             items.forEach((item:HTMLElement) => {
              if (item.firstChild.textContent === 'legend') {
                item.removeChild(item.firstChild);
              }
             });
            }, 2000);
          }
        });
      });
  }
  ngOnInit() {
    if (this.platform.is('mobileweb')) {
      this.getGeo();
    } else {
      this.features.connected.subscribe(connected => {
        this.connected = connected;
        if (connected) {
          this.features.connected.unsubscribe();
          this.getGeo();
        }
      });      
    }
  }
}