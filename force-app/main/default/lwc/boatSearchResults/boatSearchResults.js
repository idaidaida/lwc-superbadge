import { LightningElement,api,wire,track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { publish,MessageContext } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'Name',
        editable: true
    },
    {
        fieldName: 'Length__c',
        label: 'Length',
        editable: true
    },
    {
        fieldName: 'Price__c',
        label: 'Price',
        editable: true
    },
    {
        fieldName: 'Description__c',
        label: 'Description',
        editable: true
    }
]

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error creating record';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {

    selectedBoatId;
    boatTypeId;
    @track boats;
    columns = COLUMNS;
    isLoading = false;

    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method 
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.boats = result;
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
        
    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.dispatchEvent(new CustomEvent('loading'));
        this.boatTypeId = boatTypeId;
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        // メッセージサービスにevent.detail（boatId）を発行する
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(event.detail.boatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        const message = { recordId: boatId };
        publish(this.messageContext, BOATMC, message);
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        updateBoatList({data: updatedFields})
            .then(() => { 
                this.refresh();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: MESSAGE_SHIP_IT,
                        variant: SUCCESS_VARIANT
                    })
                );
                this.draftValues = [];
                this.refresh();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: error.body.message,
                        variant: ERROR_VARIANT
                    })
                );
            })
            .finally(() => {
                
            });
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.notifyLoading(true);
        return refreshApex(this.boats);
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('onloading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
     }
}