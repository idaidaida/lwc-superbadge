List<BoatReview__c> reviews = [SELECT Id,Name,Comment__c,Rating__c,Boat__c,CreatedDate FROM BoatReview__c WHERE Boat__c = 'a0C2w00000BFLISEA5'];
System.debug(reviews);