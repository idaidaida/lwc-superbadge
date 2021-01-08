public with sharing class BoatDataService {

    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        return [SELECT Id,Name FROM BoatType__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(String boatTypeId){
        if(String.isEmpty(boatTypeId)){
            return [SELECT Length__c,Price__c,Picture__c,Year_Built__c,Geolocation__c,Description__c,BoatType__c,Name,Boat_Image__c,Contact__c FROM Boat__c];
        }else{
            return [SELECT Length__c,Price__c,Picture__c,Year_Built__c,Geolocation__c,Description__c,BoatType__c,Name,Boat_Image__c,Contact__c FROM Boat__c WHERE BoatType__c = :boatTypeId];
        }
    }
}
