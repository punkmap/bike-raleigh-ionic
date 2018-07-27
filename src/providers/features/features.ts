import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
/*
  Generated class for the FeaturesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FeaturesProvider {

  constructor() {
  }
  greenways:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  facilities:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  routes:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  trailheads:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  parking:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
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
    this.greenways.next(features);
  }
  public setFacilities(features:any) {
    this.facilities.next(features);
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
