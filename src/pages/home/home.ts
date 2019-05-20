import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
//import esri = __esri;
import { loadModules } from 'esri-loader';
import { loadCss } from 'esri-loader';
import { FeaturesProvider } from '../../providers/features/features';
import { Platform } from 'ionic-angular';
//import { JsonPipe } from '@angular/common';
import { Events } from 'ionic-angular';

const layerConfig = {
"Facilities - Facility Site Assets":{

},
"Parks - Park and Recreation Areas":{},
"CaryTrails - Existing Greenway Trails":{},
}



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('map') mapEl: ElementRef;
  @ViewChild('layers') layerEl: ElementRef;
  @ViewChild('basemaps') basemapsEl: ElementRef;
  view = null;
  // get MapView(){
  //   return this.view;
  // }
  facilities = [];
  parks =[];
  greenways = [];  
  layerList;
  basemapsGallery;
  connected:boolean;
  arcgisLoaded:boolean = false;
  isStationary = true;
  manualExtent = false;
  constructor(public navCtrl: NavController, public features:FeaturesProvider, public platform:Platform, public events:Events) {
  }
  async getGeo() {
    const self = this;
  
    await this.platform.ready();
    loadCss('https://js.arcgis.com/4.8/esri/themes/dark/main.css');   
    const [WebMap, MapView]:any = await loadModules(['esri/WebMap', 'esri/views/MapView'])
    .catch(err => { console.error("ArcGIS: ", err)});
        let map = new WebMap({portalItem: {
          id: 'a15f13756c6144939ea46d6a49387b0c'
        }})
        // map.when((webmap) => {
        //   console.log("webmap.layers: ",webmap.layers)
          
        // });
        this.view = new MapView({
          container: this.mapEl.nativeElement,
          map: map,
          highlightOptions: {
            // color: [255, 241, 58],
            // fillOpacity: 0.4
              color: [255, 255, 0, 1],
              haloOpacity: 0.9,
              fillOpacity: 0.2
          },
        });
        this.view.popup.dockEnabled = true;
        this.view.popup.dockOptions =  {
          position: 'bottom-center',
          buttonEnabled: false,
          breakpoint: false
        }; 
        this.view.when((view) => {
          this.mapLoaded();
          
          view.map.layers.forEach(function(layer){
            layer.id = layer.title;

            // for (var property in layer) {
            //   if (layer.hasOwnProperty(property)) {
            //     console.log("property: " + property)
            //     if (property=="url" || property=="layerId"){
            //       console.log(layer[property])
            //     }
            //   }
            // }
            // const fl = view.map.findLayerById(layer.id)
            
          })
          
        });
  }
  createGraphicsLayers(callback){
    loadModules(['esri/layers/GraphicsLayer'])
    .then(([GraphicsLayer]) => {
      let selectedGL = new GraphicsLayer({
        id: "selectedGL",
        listMode: "hide",
      })
      let filteredGL = new GraphicsLayer({
        id: "filteredGL",
        listMode: "hide",
      })
      let searchResultGL = new GraphicsLayer({
        id: "searchResultGL",
        listMode: "hide",
      })
      this.view.map.addMany([filteredGL, selectedGL, searchResultGL])
      callback();
    })
    this.events.subscribe('GL:clear', (glType)=>{
      const gl = this.view.map.findLayerById(glType);
      gl.removeAll()
    })
  }
  mapLoaded() {
    const self = this;
    this.setZoomTo();    
    this.createGraphicsLayers(function(){
      self.setLayerFilterListeners(); 
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
        loadModules(['esri/layers/FeatureLayer','esri/tasks/support/Query'])
        .then(([FeatureLayer, Query]) => {
          this.view.map.layers.forEach(layer => {
            //let l = layer as esri.FeatureLayer;
            let l = layer;
            let query = new Query();
            query.where = "1=1";
            query.returnGeometry = true;
            query.outFields = '*';
            query.outSpatialReference = this.view.spatialReference;
            l.queryFeatures(query).then(results => {
              if (results.features.length > 0) {
                if (results.features[0].layer.title === 'Facilities - Facility Site Assets') {
                  this.sortByDistance(results.features, 'facilities');
                }
                if (results.features[0].layer.title === 'Parks - Park and Recreation Areas') {
                  this.sortByDistance(results.features, 'parks');
                }       
                if (results.features[0].layer.title === 'CaryTrails - Existing Greenway Trails') {
                  this.sortByDistance(results.features, 'greenways');
    
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
        //console.log("distance: " + parseFloat(geometryEngine.distance(feature.geometry, this.view.center, 'miles').toFixed(2)))
        feature.attributes.distance = parseFloat(geometryEngine.distance(feature.geometry, this.view.center, 'miles').toFixed(2));
      
      });
      dataset.sort((a,b) => {
        return a.attributes.distance - b.attributes.distance;
      });
      console.log("sortByDistance layer: " + layer);
      if (layer == 'facilities') {
        this.facilities = dataset;
        //this.features.setShops(dataset);
        this.features.setFacilities(dataset);          
      }
      if (layer == 'parks') {
        this.parks = dataset
        //this.features.setParking(dataset);
        this.features.setParks(dataset);          
      }
      if (layer == 'greenways') {
        this.greenways = dataset;
        //this.features.setTrailheads(dataset); 
        this.features.setGreenways(dataset); 
      }
    });
  }
  detectMapChange() {
    loadModules(["esri/geometry/geometryEngine"])
    .then(([geometryEngine]) => {
      console.log("detectMapChange")
      this.view.watch('stationary', stationary => {
        console.log("stationary: " + stationary);
        console.log("this.isStationary: " + this.isStationary);
        console.log("this.manualExtent: " + this.manualExtent);
        if (!this.isStationary && this.manualExtent) {
          this.isStationary = true;
          console.log("sortingByDistance");
          this.sortByDistance(this.facilities, 'facilities');  
          this.sortByDistance(this.parks, 'parks');
          this.sortByDistance(this.greenways, 'greenways');  
        } else {
          this.isStationary = false;
        }
        // if (stationary) {
        //   this.sortByDistance(this.facilities, 'facilities');  
        //   this.sortByDistance(this.parks, 'parks');
        //   this.sortByDistance(this.greenways, 'greenways');  
        // }
      });
      this.view.watch('extent', extent => {
        console.log("stationary: " + extent);
        this.manualExtent = true;
      });
      
      this.events.subscribe('zoomBooleans:reset', ()=>{
        this.isStationary = false;
        this.manualExtent = false;
      })
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
        let source = new LocalBasemapsSource({basemaps:[]})
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
  getExistingSymbol(layerTitle){
    const self = this
    for(var i = 0; i<this.view.map.layers.length; i ++){

    }
  }
  setZoomTo(){
    this.features.zoomto.subscribe(obj =>
      {
      if (obj && this.view) {
       this.view.popup.open({features:[obj.feature]});
       loadModules(["esri/Graphic"])
      .then(([Graphic]) => {
        let g;
        let existingSymbol; 
        if(obj.feature.geometry.hasOwnProperty("paths")){
          //existingSymbol = this.getExistingSymbol(obj.layertitle);
          var lineSymbol = {
            type: "simple-line", // autocasts as new SimpleLineSymbol()
            color: [66,244,244], // RGB color values as an array
            width: 7
          };
          obj.feature.geometry.type="polyline";
          g = new Graphic({geometry:obj.feature.geometry, symbol:lineSymbol});
          this.view.graphics.removeAll();
          this.view.graphics.add(g);
        }
        else if(obj.feature.geometry.hasOwnProperty("x")&&obj.feature.geometry.hasOwnProperty("y")){
          const selectedGL = this.view.map.findLayerById("selectedGL");
          let fl, size, xoffset, yoffset;
          if (this.features.selectedLayer==="facilities"){
            fl = this.view.map.findLayerById("Facilities - Facility Site Assets")
            size = fl.renderer.uniqueValueInfos[0].symbol.height >= fl.renderer.uniqueValueInfos[0].symbol.width ? fl.renderer.uniqueValueInfos[0].symbol.height : fl.renderer.uniqueValueInfos[0].symbol.width;
            xoffset = fl.renderer.uniqueValueInfos[0].symbol.xoffset;
            yoffset = fl.renderer.uniqueValueInfos[0].symbol.yoffset;
          }
          else if(this.features.selectedLayer==="parks"){
            fl = this.view.map.findLayerById("Parks - Park and Recreation Areas")
            console.log("fl.renderer: " + JSON.stringify(fl.renderer));
            size = fl.renderer.symbol.height >= fl.renderer.symbol.width ? fl.renderer.symbol.height : fl.renderer.symbol.width;
            xoffset = fl.renderer.symbol.xoffset;
            yoffset = fl.renderer.symbol.yoffset;   
          }
          var markerSymbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style:"square",
            color: [66, 244, 244, 0.4],
            size: size,
            xoffset: xoffset,
            yoffset: yoffset,
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [ 66, 244, 244 ],
              width: 3  // points
            }
          };
          // var markerSymbol = {
          //   type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          //   color: [66,244,244],
          //   outline: {
          //     // autocasts as new SimpleLineSymbol()
          //     color: [255, 255, 255],
          //     width: 2
          //   }
          // };
          obj.feature.geometry.type="point";
          g = new Graphic({geometry:obj.feature.geometry, symbol:markerSymbol});
          //g.symbol = markerSymbol;
          
          selectedGL.graphics.removeAll();
          selectedGL.graphics.add(g);
        }
        this.view.goTo(obj.feature);
      })
     }
   });  
  }
  setLayerFilterListeners(){
    const self = this;
    const view = this.view;
    loadModules(["esri/Graphic"])
    .then(([Graphic]) => {
      this.features.parkFilter.subscribe(features => {
        console.log("facilities selectedLayer: " + this.features.selectedLayer);
        if (self.features.selectedLayer=="parks"){  
          console.log("this.features.parkFilter.subscribe")
          const fl = view.map.findLayerById("Parks - Park and Recreation Areas");
          fl.queryFeatureCount().then(function(count) {
            const filteredGL = view.map.findLayerById("filteredGL");
            if (features.length < count ){
              const size = fl.renderer.symbol.height >= fl.renderer.symbol.width ? fl.renderer.symbol.height : fl.renderer.symbol.width;
              var markerSymbol = {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                style:"square",
                color: [255, 241, 58, 0.4],
                size: size,
                xoffset: fl.renderer.symbol.xoffset,
                yoffset: fl.renderer.symbol.yoffset,
                outline: {
                  // autocasts as new SimpleLineSymbol()
                  color: [ 255, 241, 58 ],
                  width: 3  // points
                }
              };
              let filterGraphics = [];
              features.forEach(function(feature){
                feature.geometry.type="point";
                filterGraphics.push(new Graphic({geometry:feature.geometry, symbol:markerSymbol}))
              })
              filteredGL.removeAll();
              filteredGL.addMany(filterGraphics);
              console.log("parks map.goTo")
              //view.goTo(filterGraphics);
              this.manualExtent = false;
              console.log("parks map.goTo")
              
            } else {
              filteredGL.removeAll();
            }
          })
        }
      })
      this.features.facilityFilter.subscribe(features => {
        console.log("parks selectedLayer: " + this.features.selectedLayer);
        if (self.features.selectedLayer=="facilities"){  
          console.log("this.features.facilityFilter.subscribe")
        
          const fl = view.map.findLayerById("Facilities - Facility Site Assets");
          //console.log(JSON.stringify(fl.renderer));
          //console.log(JSON.stringify(fl.renderer.uniqueValueInfos[0]))
          fl.queryFeatureCount().then(function(count) {
            const filteredGL = view.map.findLayerById("filteredGL");
            if (features.length < count ){
              const size = fl.renderer.uniqueValueInfos[0].symbol.height >= fl.renderer.uniqueValueInfos[0].symbol.width ? fl.renderer.uniqueValueInfos[0].symbol.height : fl.renderer.uniqueValueInfos[0].symbol.width;
              var markerSymbol = {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                style:"square",
                color: [255, 241, 58, 0.4],
                size: size,
                xoffset: fl.renderer.uniqueValueInfos[0].symbol.xoffset,
                yoffset: fl.renderer.uniqueValueInfos[0].symbol.yoffset,
                outline: {
                  // autocasts as new SimpleLineSymbol()
                  color: [ 255, 241, 58 ],
                  width: 3  // points
                }
              };
              let filterGraphics = [];
              features.forEach(function(feature){
                feature.geometry.type="point";
                filterGraphics.push(new Graphic({geometry:feature.geometry, symbol:markerSymbol}))
              })
              filteredGL.removeAll();
              filteredGL.addMany(filterGraphics);
              console.log("facilities map.goTo");
              
              //view.goTo(filterGraphics);
              
              this.manualExtent = false;
              console.log("facilities map.goTo");
            } else {
              filteredGL.removeAll();
            } 
          })
        }  
      })
    })
  }
  loadWidgets() {
    loadModules([
        "esri/widgets/Track",
        "esri/widgets/LayerList",
        "esri/widgets/Compass",
        "esri/widgets/Search", 
        'esri/layers/GraphicsLayer', 
        'esri/Graphic', 
        'esri/symbols/PictureMarkerSymbol', 
        'esri/geometry/support/webMercatorUtils'
      ])
      .then(([
          Track, 
          LayerList, 
          Compass, 
          Search, 
          GraphicsLayer, 
          Graphic, 
          PictureMarkerSymbol, 
          webMercatorUtils
        ]) => {   
        this.loadBaseMapGallery(); 
        let track = new Track({view: this.view});
        this.view.ui.add(track, 'top-left');

        let compass = new Compass({view: this.view});
        
        // Adds the search widget below other elements in
        // the top left corner of the view
        
        this.view.ui.add(compass, 'top-left');
        this.view.ui.remove("attribution");
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
        var searchWidget = new Search({
          view: this.view,
          locationEnabled: false,
          resultGraphicEnabled: false,
        });
        this.view.ui.add(searchWidget, {
          position: "top-right",
        });
        
        
        const height = 36;
        const width = height;
        const yoffset = height*0.375;
        const xoffset = height*0.083;
        const resultIcon = new PictureMarkerSymbol({url:'../../assets/icon/PushPin.png', height: height, width: width, yoffset: yoffset, xoffset: xoffset})
        searchWidget.on('search-complete', function(event) {
          const searchResultGL = this.view.map.findLayerById("searchResultGL")
          let mapPoint = webMercatorUtils.webMercatorToGeographic(event.results[0].results[0].feature.geometry)
          let resultG = new Graphic({
            geometry: mapPoint, 
            symbol: resultIcon
          });
          searchResultGL.graphics.removeAll();  
          searchResultGL.graphics.add(resultG)
        })
        searchWidget.on('search-clear', function(event) {
          const searchResultGL = this.view.map.findLayerById("searchResultGL")
          searchResultGL.graphics.removeAll();  
        })

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