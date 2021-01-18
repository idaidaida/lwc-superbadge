import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading = true;
    
    // Getter and Setter to allow for logic to run on recordId change
    get recordId() {
        return this.boatId;
     }

    @api
    set recordId(value) {
        //sets boatId attribute
        this.setAttribute('boatId', value);
        
        //sets boatId assignment
        this.boatId = value;

        //get reviews associated with boatId
        this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        if (this.boatReviews == null || this.boatReviews.length == 0) {
            console.log('No Record:' + this.boatReviews);
            return false;
        } else {
            console.log('Exist Reocrds:' + this.boatReviews);
            return true;
        }
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
     }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (this.boatId == '') {
            return;
        }

        // set isLoading
        this.isLoading = true;

        // get All Reviews
        getAllReviews({ boatId: this.boatId })
            .then((result) => {
                this.boatReviews = result;
            })
            .catch((error) => {
            });
        
        // finish loading
        this.isLoading = false;
    }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
        const userId = event.target.getAttribute('data-record-id');
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: userId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
     }
  }
  