import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe,APPLICATION_SCOPE,  MessageContext } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { LightningElement, wire, api } from 'lwc';

import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD,];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    
    @api boatId;

    @wire(MessageContext)
    messageContext;
    
    @wire(getRecord,{ recordId : '$boatId', fields : BOAT_FIELDS})
    wiredRecord;

    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelPleaseSelectABoat,
        labelFullDetails
    };
  
//   // Decide when to show or hide the icon
//   // returns 'utility:anchor' or null
    get detailsTabIconName() {
        if (this.wiredRecord.data) {
            return 'utility:anchor';
        }else{
            return null;
        }
    }
  
//   // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }
  
    // Private
    subscription = null;
  
    // Subscribe to the message channel
    subscribeMC() {
        if (this.subscription || this.recordId) {
            return;
          }
            
          // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
          if (!this.subscription) {
              this.subscription = subscribe(
                  this.messageContext,
                  BOATMC,
                  (message) => this.boatId = message.recordId,
                  { scope: APPLICATION_SCOPE }
              );
          }   
        // local boatId must receive the recordId from the message
    }
  
    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }
  
    //Navigates to record page
    // 詳細ページの飛ぶためのリンクを作るまだできてない
    navigateToRecordViewPage() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view'
            }
        });
    }
  
    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
        console.log("Accept Create Event");
        // activate review by qurerySelector
        this.template.querySelector('lightning-tabset').activeTabValue = 'Reviews';
        console.log("Accept Activate");
        // refresh review tab
        this.template.querySelector('c-boat-reviews').refresh();
    }
}