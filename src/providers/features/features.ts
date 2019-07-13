import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
/*
  Generated class for the FeaturesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FeaturesProvider {

  constructor() {
  }
  selectedLayer:string = "facilities";
  greenways:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  facilities:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  facilitiesFiltered:boolean=false;
  facilityFilter:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  listFacilities:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedFacilities:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  parks:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  parksFiltered:boolean=false;
  parkFilter:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  listParks:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedParks:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  routes:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  parking:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  trailheads:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  racks:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  shops:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  zoomto:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  layerEl:BehaviorSubject<ElementRef> = new BehaviorSubject<ElementRef>(null);
  basemapsEl:BehaviorSubject<ElementRef> = new BehaviorSubject<ElementRef>(null);
  arcgisLoaded:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  connected:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  nearbySelected:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public setConnection(connected:boolean) {
    this.connected.next(connected);
  }
  public setGreenways(features:any) {
    //console.log("setGreenways here");
    this.greenways.next(features);
  }
  public setSelectedLayer(layer:string){
    this.selectedLayer=layer;
  }
  public setFacilities(features:any) {
    this.selectedFacilities["_value"].sort(function(a, b){
      return a.attributes.distance-b.attributes.distance
    })
    if(this.facilitiesFiltered){
      this.listFacilities.next(this.selectedFacilities["_value"])
      this.setFacilityFilter(this.selectedFacilities["_value"]);
    } else {
      this.listFacilities.next(features);
      this.facilities.next(features);
      // this.setFacilityFilter(null);
    } 
  }
  public filterFacilities (facTypes:string[]){
    console.log("facTypes.length: " + facTypes.length);
    this.facilitiesFiltered = facTypes.length > 0 ? true : false;
    console.log("this.facilitiesFiltered: " + this.facilitiesFiltered)
    if (this.facilitiesFiltered){
      let selectedFacilities = [];
      this.facilities["_value"].forEach(function(facility){
        if(facTypes.indexOf(facility.attributes.FEATURECODE)>-1){
          selectedFacilities.push(facility);
        }
      })
      this.listFacilities.next(selectedFacilities);
      this.selectedFacilities.next(selectedFacilities);
      this.setFacilityFilter(selectedFacilities);
    } else {
      this.listFacilities.next(this.facilities["_value"]);
      this.setFacilityFilter(this.facilities["_value"]);
    }
  }
  public setFacilityFilter (features:any){
    //console.log("setFacilityFilter features: " + features)
    this.facilityFilter.next(features);
    //console.log("this.parkFilter: " + JSON.stringify(this.parkFilter))
  }

  public setParks(features:any) {
    this.selectedParks["_value"].sort(function(a, b){
      return a.attributes.distance-b.attributes.distance
    })
    if (this.parksFiltered){
      this.listParks.next(this.selectedParks["_value"])
    } else {
      this.listParks.next(features);
      this.parks.next(features);
    }
  }
  public filterParks (facTypes:string[], parkAmenities:any[]){
    console.log("filterparks facTypes: "+facTypes);
    this.parksFiltered = parkAmenities.length > 0 ? true : false;
    const self = this;
    if(this.parksFiltered){
      let selectedParks = [];
      let parkPushed = false;
      this.parks["_value"].forEach(function(park){
        let pass = true;
        facTypes.forEach(function(fieldname){
          let strField = self.getParkAmenityFieldName(fieldname, parkAmenities);
          console.log('park.attributes[strField]: ' + park.attributes[strField]);
          if (!park.attributes[strField]||park.attributes[strField]==='No'){
            pass = false;
          }
          else { console.log ('you can pass this puppy')}
        })
        //console.log("pass: " + pass);
        if(pass===true){
          selectedParks.push(park);
          parkPushed = true;
        }
      })
      if (parkPushed){
        //console.log("parksNeedToBePushed");
        this.listParks.next(selectedParks);
        this.setParkFilter(selectedParks);
        this.selectedParks.next(selectedParks);
      } else {
        //console.log("absoluttely NO parksNeedToBePushed");
        this.listParks.next(this.parks["_value"]);
        this.setParkFilter(this.parks["_value"]);
      }
    } else {
      this.listParks.next(this.parks["_value"])
      this.setParkFilter(this.parks["_value"]);
    }
  }
  public setParkFilter (features:any){
    console.log("setParkFilter features: " + features)
    this.parkFilter.next(features);
    //console.log("this.parkFilter: " + JSON.stringify(this.parkFilter))
  }
  public getParkAmenityFieldName(fieldLabel, parkAmenities){
    let fieldName;
    for (let i = 0; i < parkAmenities.length; i++){
      //console.log(this.parkAmenities[i].label + ")) <> ((" + fieldLabel);
      if(parkAmenities[i].label === fieldLabel){
        //console.log("this.parkAmenities[i].label: " + this.parkAmenities[i].label);
        fieldName = parkAmenities[i].name;
        break;
      }
    }
    return fieldName;
  }
  public setRoutes(features:any) {
    this.routes.next(features);
  }
  public setTrailheads(features:any) {
    this.trailheads.next(features);
  }
  public setParking(features:any) {
    this.parking.next(features);
  }
  public setShops(features:any) {
    this.shops.next(features);
  }      
  public setRacks(features:any) {
    this.racks.next(features);
  }      
  public setZoomTo(feature:any) {
    this.zoomto.next(feature);
  }      
  public setLayerEl(el:ElementRef) {
    this.layerEl.next(el);
  }
  public setBasemapsEl(el:ElementRef) {
    this.basemapsEl.next(el);
  }  
  public setArcGisLoaded(loaded:boolean) {
    this.arcgisLoaded.next(loaded);
  }
  public setNearbySelected(selected:boolean) {
    this.nearbySelected.next(selected);
  }
}
