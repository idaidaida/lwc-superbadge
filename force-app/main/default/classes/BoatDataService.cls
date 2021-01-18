public with sharing class BoatDataService {

    public static final String LENGTH_TYPE = 'Length'; 
    public static final String PRICE_TYPE = 'Price'; 
    public static final String TYPE_TYPE = 'Type'; 

    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        return [SELECT Id,Name FROM BoatType__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(String boatTypeId){
        if(String.isEmpty(boatTypeId)){
            return [SELECT Length__c,Price__c,Picture__c,Year_Built__c,Description__c,BoatType__r.Name,Name,Boat_Image__c,Contact__r.Name FROM Boat__c];
        }else{
            return [SELECT Length__c,Price__c,Picture__c,Year_Built__c,Description__c,BoatType__r.Name,Name,Boat_Image__c,Contact__r.Name FROM Boat__c WHERE BoatType__c = :boatTypeId];
        }
    }

    @AuraEnabled(cacheable=false)
    public static void updateBoatList(List<Boat__c> boats){
        update boats;
    }

    @AuraEnabled(cacheable=true)
    public static String getBoatsByLocation(String boatTypeId, Double latitude, Double longitude){
        String query = 'SELECT Name, Geolocation__Latitude__s, Geolocation__Longitude__s FROM Boat__c ';
        if (String.isNotBlank(boatTypeId)) {
            query += 'WHERE BoatType__c = :boatTypeId ';
        }
        query += 'ORDER BY DISTANCE(Geolocation__c, GEOLOCATION(:latitude, :longitude), \'mi\') LIMIT 10';
        return JSON.serialize(Database.query(query));
    }

    @AuraEnabled(cacheable=false)
    public static List<BoatReview__c> getAllReviews(Id boatId){
        return [SELECT CreatedById,Id,Name,Comment__c,Rating__c,CreatedBy.Name,CreatedBy.CompanyName,CreatedBy.SmallPhotoUrl,CreatedDate FROM BoatReview__c Where Boat__c = :boatId];
    }


    @AuraEnabled(cacheable = true)
    public static List<Boat__c> getSimilarBoats(Id boatId, String similarBy) {
        List<Boat__c> boatList = [SELECT Id, Length__c, Price__c, BoatType__c, BoatType__r.Name
                                    FROM Boat__c
                                    WHERE Id = :boatId ];
        if (boatList.isEmpty()) {
            return new List<Boat__c>();
        }
        Boat__c boat = boatList[0];
        if (similarBy == LENGTH_TYPE) {
            return [
                SELECT Id, Contact__r.Name, Name, BoatType__c, BoatType__r.Name, Length__c, Picture__c, Price__c, Year_Built__c
                FROM Boat__c
                WHERE Id != :boat.Id
                AND (Length__c >= :boat.Length__c / 1.2)
                AND (Length__c <= :boat.Length__c * 1.2)
                ORDER BY Length__c, Price__c, Year_Built__c
            ];
        } 
        if (similarBy == PRICE_TYPE) {
            return [
                SELECT Id, Contact__r.Name, Name, BoatType__c, BoatType__r.Name, Length__c, Picture__c, Price__c, Year_Built__c
                FROM Boat__c
                WHERE Id != :boat.Id
                AND (Price__c >= :boat.Price__c / 1.2)
                AND (Price__c <= :boat.Price__c * 1.2)
                ORDER BY Price__c, Length__c, Year_Built__c
            ];
        } 
        if (similarBy == TYPE_TYPE) {
            return [
                SELECT Id, Contact__r.Name, Name, BoatType__c, BoatType__r.Name, Length__c, Picture__c, Price__c, Year_Built__c
                FROM Boat__c
                WHERE Id != :boat.Id
                AND (BoatType__c = :boat.BoatType__c)
                ORDER BY Price__c, Length__c, Year_Built__c
            ];
        }
        return new List<Boat__c>();
    }

}
