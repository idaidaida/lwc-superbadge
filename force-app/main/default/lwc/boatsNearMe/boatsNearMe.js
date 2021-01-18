import { LightningElement, api, wire,track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    @track mapMarkers = [];
    @track isLoading = true;
    @track isRendered;
    latitude;
    longitude;
    
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation,{ boatTypeId : '$boatTypeId', latitude : '$latitude', longitude : '$longitude' })
    wiredBoatsJSON({ error, data }) {
        
        if (data) {
			this.isLoading = true;
			const objectData = JSON.parse(data);
			this.createMapMarkers(objectData);
			this.isLoading = false;
        } else if (error) {
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error,
                    variant: ERROR_VARIANT
                })
            );
            this.dispatchEvent(toastEvent);
			this.isLoading = false;
        }
        
     }
    
    getLocationFromBrowser() {
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            });
    }

    renderedCallback() {
        if (this.isRendered) return;
        this.isRendered = true;
        this.getLocationFromBrowser();
    }
  
    // Creates the map markers
    createMapMarkers(boatData) {
        this.isLoading = true;
        const newMarkers = boatData.map(boat => {
            const location = {
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                title: boat.Name,
                description: `Coords: ${boat.Geolocation__Latitude__s}, ${boat.Geolocation__Longitude__s}`,
				icon: 'action:map',
            }
            return location;
        });
        
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            description: `Coords: ${this.latitude}, ${this.longitude}`,
			icon: ICON_STANDARD_USER 
        });
        this.mapMarkers = newMarkers;
        this.isLoading = false;
    }

    // Getter method for displaying the map component, or a helper method.
    get showMap() {
        return this.mapMarkers.length > 0;
    }
}
