public class getAppointmentSlots {
    @AuraEnabled(cacheable=true)
    public static list<event> getSlots(CustomWrapper wrapper){
       Id worktype = wrapper.worktype;
       Id serviceterritory=wrapper.serviceterritory;
       datetime dt = wrapper.dt;
       Integer numSlots=wrapper.numSlots;
        system.debug('in getSlots');
       //build an instance of getAppointmentSlotsInput with builder class and set parameters
       lxscheduler.WorkType wt = new lxscheduler.WorkTypeBuilder()
            .setId(worktype)
            .build();
       lxscheduler.GetAppointmentCandidatesInput input = new lxscheduler.GetAppointmentCandidatesInputBuilder()
           .setWorkType(wt)
           .setTerritoryIds(new List<String>{serviceterritory})
           //.setAccountId(pl.accountId)
           .setStartTime(dt.format('yyyy-MM-dd\'T\'HH:mm:ssZ'))
           .setEndTime(Datetime.now().addDays(10).format('yyyy-MM-dd\'T\'HH:mm:ssZ'))
           //.setSchedulingPolicyId(pl.schedulingPolicyId)
           .setApiVersion(Double.valueOf('50.0'))
           .build();
       
       //call getAppointmentCandidates from lxscheduler namespace
       String response = lxscheduler.SchedulerResources.getAppointmentCandidates(input);
       
       //parse the results using JSON.deserialize
       if(response==null) return null;
       list<timeSlots> allslots = timeSlots.parse(response);
       system.debug(response);
       system.debug(allslots.size());

        //event return list
        list<event> returnlist = new list<event>();

       //slots found, return numSlots amount or as many as possible
       if(allslots.size() != 0) {
            //handle greater or equal to numSlots property
            if(allslots.size() >= numSlots){
                for (Integer i = 0; i < numSlots; i++) {
                    event thisevent = new event();
                    system.debug('slot: '+allslots[i]);
                    thisevent.startdatetime = allslots[i].startTime;
                    thisevent.enddatetime = allslots[i].endTime;
                    List<ServiceResource> mylist = new List<ServiceResource>();
                    mylist = [SELECT Name From ServiceResource WHERE Id=:allslots[i].resources[0]];
                    thisevent.description = mylist[0].Name;
                    thisevent.whoid=allslots[i].resources[0];
                    returnlist.add(thisevent);
                }
            }
            //handle less than numSlots
            else {
                for(Integer i = 0; i < allslots.size(); i++){
                    event thisevent = new event();
                    system.debug('slot: '+allslots[i]);
                    thisevent.startdatetime = allslots[i].startTime;
                    thisevent.enddatetime = allslots[i].endTime;
                    List<ServiceResource> mylist = new List<ServiceResource>();
                    mylist = [SELECT Name From ServiceResource WHERE Id=:allslots[i].resources[0]];
                    thisevent.description = mylist[0].Name;
                    thisevent.whoid=allslots[i].resources[0];
                    returnlist.add(thisevent);
                }
            }
           
           //check resources not null
           //if(allslots[0].resources != null){
           //    thisevent.whoid = allslots[0].resources[0];
           //}
           system.debug(returnlist.size());
           return returnlist;
       }
       //no slots found, return null
       system.debug('didnt find a slot, returning null');
       return null;
    }

   public with sharing class CustomWrapper {
    @AuraEnabled
    public Id workType { get; set; }
    @AuraEnabled
    public Id serviceTerritory { get; set; }
    @AuraEnabled
    public datetime dt { get; set; }
    @AuraEnabled
    public Integer numSlots { get; set; }
}
}