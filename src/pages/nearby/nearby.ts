import { Component, OnInit, ɵConsole } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FeaturesProvider } from '../../providers/features/features';

import { Events } from 'ionic-angular';
// import { loadModules } from 'esri-loader';
// import { createOfflineCompileUrlResolver } from '@angular/compiler';
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
  //show: boolean = true;
  facilitiesFiltered: boolean = false;
  facilityFilterOptions:any[] = [];
  facilities:any[] = [];
  selectedFacilities:any[] = [];
  listFacilities:any[] = [];
  facilityTypes:any[]=[];
  
  parksFiltered: boolean = false;
  parkFilterOptions:any[] = [];
  parks:any[] = [];
  selectedParks:any[]=[];
  listParks:any[]=[];
  parkAmenities:any[]=[];
  parkAmenitiesForHTML:any[]=[];

  greenways:any[] = [];
  list = 'facilities';
  facilitySelect = [];
  parkSelect = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public features:FeaturesProvider, public events:Events) {
  }

  itemTapped(event, item, layertitle) {
    this.features.zoomto.next({"feature":item, "layertitle" : layertitle});
  }
  facilityFilterChanged(event){
    console.log("facilityFilterChanged event: " + event);
    this.features.filterFacilities(event);
    //this.facilityFilterOptions = event;
    this.facilitySelect = event;
  }
  parkAmenitiesFilterChanged(event){
    console.log("parkAmenitiesFilterChanged event: " + event);
    this.features.filterParks(event, this.parkAmenities);
    //this.parkFilterOptions = event;
    this.parkSelect = event;
  }
  
  getParkAmenityFieldName (fieldLabel){
    //console.log("this.parkAmenities: " + this.parkAmenities)
    let fieldName;
    for (let i = 0; i < this.parkAmenities.length; i++){
      //console.log(this.parkAmenities[i].label + ")) <> ((" + fieldLabel);
      if(this.parkAmenities[i].label === fieldLabel){
        //console.log("this.parkAmenities[i].label: " + this.parkAmenities[i].label);
        fieldName = this.parkAmenities[i].name;
        break;
      }
    }
    return fieldName;
  }
  segmentClick(layer){
    console.log("segmentClick layer: " + layer)
    
    this.features.setSelectedLayer(layer);
    this.events.publish('zoomBooleans:reset')
    if(layer==="facilities"){
      this.events.publish('GL:clear', 'filteredGL');
      this.events.publish('GL:clear', 'selectedGL');
      console.log("this.facilityFilterOptions: " + this.facilitySelect);
      this.features.filterFacilities(this.facilitySelect); 
    }
    else if(layer==="parks"){
      this.events.publish('GL:clear', 'filteredGL');
      this.events.publish('GL:clear', 'selectedGL');
      console.log("segmentClick parkSelect: " + this.parkSelect);
      console.log("segmentClick facilitySelect: " + this.facilitySelect);
      this.features.filterParks(this.parkSelect, this.parkAmenities); 
    }
    else if(layer==="greenways"){
      this.events.publish('GL:clear', 'filteredGL');
      this.events.publish('GL:clear', 'selectedGL');
    }
    this.list = layer;
  }
  ngOnInit() {
    // console.log('list: '+ this.list)
    //if (this.list === 'facilities'){this.show = true}else{this.show = false}
    this.features.listFacilities.subscribe(features => {
      
      console.log("this.features.listFacilities.subscribe");
      features.forEach(feature => {
        //console.log("feature.attributes.FEATURECODE: " + JSON.stringify(feature.attributes.FEATURECODE));
        // console.log("feature.attributes.FEATURECODE: " + feature.attributes.FEATURECODE);
        if (this.facilityTypes.indexOf(feature.attributes.FEATURECODE)==-1&&feature.attributes.FEATURECODE !=null) {
          this.facilityTypes.push(feature.attributes.FEATURECODE)
        }
      });
      //this.facilities = features;
      // console.log("features[0]: " + JSON.stringify(features[0]));
      this.facilities = features;
       this.listFacilities = this.facilitiesFiltered === false ? features : this.selectedFacilities;
      //console.log('this.listFacilities: ' + JSON.stringify(this.listFacilities))
    })
    this.features.greenways.subscribe(features => {
      this.greenways = features;
      console.log("this.features.greenways.subscribe");
    })
    this.features.listParks.subscribe(features => {
      this.parkAmenities = [
        {"name":"RESTROOM","label":"Restroom"},
        {"name":"CAMPING","label":"Camping"},
        {"name":"ADACOMPLY","label":"ADA Compliant"},
        {"name":"SWIMMING","label":"Swimming"},
        {"name":"HIKING","label":"Hiking"},
        {"name":"FISHING","label":"Fishing"},
        {"name":"PICNIC","label":"Picnic"},
        {"name":"BOATING","label":"Boating"},
        {"name":"HUNTING","label":"Hunting"},
        {"name":"ROADCYCLE","label":"Road Biking"},
        {"name":"MTBCYCLE","label":"Mountain Biking"},
        {"name":"PLAYGROUND","label":"Playground"},
        {"name":"GOLF","label":"Golf"},
        {"name":"SKI","label":"Ski"},
        {"name":"SOCCER","label":"Soccer"},
        {"name":"BASEBALL","label":"Baseball"},
        {"name":"BASKETBALL","label":"Basket Ball"},
        {"name":"TENNISCOURT","label":"Tennis Court"},
        {"name":"SKATEPARK","label":"Skate Park"},
        {"name":"VOLLEYBALL","label":"Vollyball"},
        {"name":"FITNESSTRAIL","label":"Fitness Trail"},
        {"name":"TRAILHEAD","label":"Trailhead"},
        {"name":"NATURETRAIL","label":"Nature Trail"},
        {"name":"OPENSPACE","label":"Open Space"},
        {"name":"LAKE","label":"Lake"},
        {"name":"DOGPARK","label":"Dog Park"},
        {"name":"DISCGOLF","label":"Disk Golf"},
        {"name":"CLIMBINGROCKS","label":"Climbing Rocks"},
        {"name":"AMPITHEATER","label":"Amphitheater"},
        {"name":"CLIMBINGROPES","label":"Climbing Ropes"},
        {"name":"BATTINGCAGES","label":"Batting Cages"}
      ]
      this.parkAmenitiesForHTML = JSON.parse(JSON.stringify(this.parkAmenities)) 
      console.log("this.features.listParks.subscribe");
      this.listParks = this.parksFiltered === false ? features : this.selectedParks; 
      //this.parks = features;
    })      
  }
}
