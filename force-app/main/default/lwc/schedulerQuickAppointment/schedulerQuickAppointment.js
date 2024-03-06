import { LightningElement, api, wire, track } from 'lwc';
import {refreshApex} from '@salesforce/apex';
import getSlots from '@salesforce/apex/getAppointmentSlots.getSlots';
import { createRecord } from 'lightning/uiRecordApi';


const columns = [
  { label: 'Start Time', fieldName: 'StartDateTime', type: 'date',
   typeAttributes:{
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }
  },
  { label: 'End Time', fieldName: 'EndDateTime', type: 'date',   
  typeAttributes:{
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }
  },
  { label: 'Service Resource', fieldName: 'Description'},
  {label: 'Action', type: 'button', typeAttributes: 
    { label: 'Book', name: 'book', title: 'Click to Schedule Appointment'}
  },

];

const anonymousColumns = [
  { label: 'Start Time', fieldName: 'StartDateTime', type: 'date',
   typeAttributes:{
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }
  },
  { label: 'End Time', fieldName: 'EndDateTime', type: 'date',   
  typeAttributes:{
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }
  },
  {label: 'Action', type: 'button', typeAttributes: 
    { label: 'Book', name: 'book', title: 'Click to Schedule Appointment'}
  },

];
export default class SchedulerQuickAppointment extends LightningElement {
    worktype;
    serviceterritory;
    datetime;
    @track slots;
    slotsResult;
    @api recordId;
    @api slotCount;
    @api defaultWT;
    @api defaultST;
    @api anonymous=false;
    
    //init function called on page load
    connectedCallback() {
      console.log(this.recordId);
      //check if user specifies a default work type
      if(this.defaultWT !=undefined){
        this.worktype=this.defaultWT;
        console.log('autofilled with wt: '+this.defaultWT);
      }
      else{
        console.log('no default wt specified');
      }

      //check if user specifies a default service territory
      if(this.defaultST !=undefined){
        this.serviceterritory=this.defaultST;
        console.log('autofilled with st: '+this.defaultST);
      }
      else{
        console.log('no default st specified');
      }
      
      //check if user specifies anonymous booking
      if(this.anonymous){
        this.columns = anonymousColumns;
        console.log('anonymous sr');
      }
      else{
        this.columns=columns;
        console.log('known sr');
      }
  }

    handleWTChange(event) {
        this.worktype=event.detail.recordId;
    }
    handleSTChange(event) {
        this.serviceterritory=event.detail.recordId;
    }
    /*filterTerritories = {
        criteria: [
          {
            fieldPath: "ServiceTerritories__r.WorkTypeID",
            operator: "eq",
            value: this.worktype,
          },
        ],
      };*/
    handleDTChange(event) {
        this.datetime=event.target.value;
        refreshApex(this.slotsResult);
    }
    bookSA(event){
      this.createSA(event)




      
    
    }

    async createSA(event){
      const row = event.detail.row;
      console.log('here');
      console.log('srid: '+row.whoId);
      const recordInput = {
        apiName: "ServiceAppointment",
        fields: {
          "ServiceTerritoryId": this.serviceterritory,
          "AppointmentType" : "company",
          "ParentRecordId" : this.recordId,
          "EarliestStartTime" : row.StartDateTime,
          "DueDate" : row.EndDateTime,
          "SchedStartTime" : row.StartDateTime,
          "SchedEndTime" : row.EndDateTime,
          "Status" : "Scheduled",
          "WorkTypeId" : this.worktype
        }
      };
      console.log(this.recordId);
      console.log('here2');
      createRecord(recordInput).then(response => {
        console.log('SA created with Id:', response.id);
      }).catch(error => {
      console.log('Error Message', error.body.message);
      });
      //Need way to return response into the create AR function
    }

    async createAR(event){
      await createSA(event);
      console.log('now creating AR...');
      //console.log(row.description);
      const arInput = {
        apiName: "AssignedResource",
        fields: {
          "IsRequiredResource" : True,
          "ServiceResourceId" : '0HnHr000000cPwIKAU',
          "ServiceAppointmentId" : response.id
        }
      };
      createRecord(arInput).then(arResponse => {
        console.log('AR created with Id:', arResponse.id);
      }).catch(error => {
        console.log('Error Message', error.body.message);
      });
    }



    getAppointments(){
      console.log('ingetAppts');
      let parameterObject = {
        worktype: this.worktype,
        serviceterritory: this.serviceterritory,
        dt: this.datetime,
        numSlots: this.slotCount
      };
      console.log(this.datetime);
      getSlots({ wrapper: parameterObject})
      .then((result) => {
        this.getSlots = result;
        this.slots=result;
        console.log(this.getSlots);
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.getSlots = undefined;
      });

    }

}