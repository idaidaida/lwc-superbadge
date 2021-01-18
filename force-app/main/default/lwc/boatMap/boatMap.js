import { LightningElement, api, wire, track } from 'lwc';
import { subscribe, unsubscribe, MessageContext,APPLICATION_SCOPE } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { getRecord } from 'lightning/uiRecordApi';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
export default class BoatMap extends LightningElement {
    // private
    subscription = null;
    boatId;
    error = undefined;
    mapMarkers = [];
    
    // Getter and Setter to allow for logic to run on recordId change
    // this getter must be public
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    // Initialize messageContext for Message Service
    @wire(MessageContext)
    messageContext;
    
    // Getting record's location to construct map markers using recordId
    // Wire the getRecord method using ('$boatId')
    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord({ error, data }) {
        // Error handling
        if (data) {
            this.error = undefined;
            const longitude = data.fields.Geolocation__Longitude__s.value;
            const latitude = data.fields.Geolocation__Latitude__s.value;
            this.updateMap(longitude, latitude);
        } else if (error) {
            this.error = error;
            this.boatId = undefined;
            this.mapMarkers = [];
        }
    }

    connectedCallback() {

      }
      
    subscribeMC() {
        let subscription = subscribe(this.messageContext, BOATMC, (message) => { this.boatId = message.recordId }, { scope: APPLICATION_SCOPE });
    }
    
    // Calls subscribeMC()
    connectedCallback() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
          }
          // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
          this.subscribeMC();
    }

    // Subscribes to the message channel
    subscribeMC() {


            this.subscription = subscribe(
                this.messageContext,
                BOATMC,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
    
    handleMessage(message) {
        this.boatId = message.recordId;
    }


    // Creates the map markers array with the current boat's location for the map.
    updateMap(Longitude, Latitude) {
        this.mapMarkers = [{
                location: {
                    Latitude: Latitude,
                    Longitude: Longitude
            },
            description: 'Coords: ${Latitude}, ${Longitude}',
            icon: 'utility:animal_and_nature'
        }];
    }

    // Getter method for displaying the map component, or a helper method.
    get showMap() {
        return this.mapMarkers.length > 0;
    }
}