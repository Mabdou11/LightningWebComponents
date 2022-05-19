import { LightningElement, wire, api, track} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getProducts from '@salesforce/apex/ProductSelectionController.getProducts';

const columns = [{
        label: 'Name',
        fieldName: 'Name',
        type: 'text',
        sortable: true
    },
    {
        label: 'Product Code',
        fieldName: 'ProductCode',
        type: 'text',
        sortable: true
    },
    {
        label: 'Description',
        fieldName: 'Description',
        sortable: false
    }
];

export default class SearcheableDatatable extends LightningElement {
    @track value;
    @track error;
    @track data;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
    @api allSelectedRows = [];
    @api selectedSingleRow;
    @api filters = '';

    hasSelection = false;

    // This will make the selection required. 
    @api
    validate() {
        if(this.hasSelection){ 
            return { isValid: true }; 
        } 
        else { 
            // If the component is invalid, return the isValid parameter 
            // as false and return an error message. 
            return { 
                isValid: false, 
                errorMessage: 'Please select a record in order to continue.' 
             }; 
         }
    }



    result;
    page = 1; 
    items = []; 
    data = []; 
    columns; 
    startingRecord = 1;
    endingRecord = 0; 
    pageSize = 10; 
    totalRecountCount = 0;
    totalPage = 0;

    isPageChanged = false;
    initialLoad = true;
    mapoppNameVsOpp = new Map();;
    @wire(getProducts, {searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection', filters: '$filters'})
    wiredRecords({ error, data }) {
        console.log("filters == "+ this.filters);
        console.log(" WIRE!");
        console.log(data);
        if (data) {
            this.processRecords(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    processRecords(data){
        console.log("Process Records");

        this.items = data;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        this.hasSelection = false;
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = this.allSelectedRows;

    }

    //clicking on next button this method will be called
    nextHandler() {
        this.hasSelection = false;
        this.isPageChanged = true;
        if((this.page < this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = this.allSelectedRows;        
        console.log("SELECTED ROWS");
        console.log(this.allSelectedRows);

    }

    //this method displays records page by page
    displayRecordPerPage(page){
        console.log("Display Records per Page");
        console.log(page);
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
    
    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);
        
    }
    
    onRowSelection(event){
        this.hasSelection = true;
        if(!this.isPageChanged || this.initialLoad){
            if(this.initialLoad) this.initialLoad = false;
            this.processSingleSelection(event);
        }else{
            this.processSingleSelection(event);
            this.isPageChanged = false;
            this.initialLoad =true;
        }

    }

    processSingleSelection(event){
        console.log("Selection:"+JSON.stringify(JSON.parse(JSON.stringify(event.detail)).selectedRows));
        this.allSelectedRows = JSON.parse(JSON.stringify(event.detail)).selectedRows;
        this.selectedSingleRow = this.allSelectedRows[this.allSelectedRows.length-1];
    }
    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        var data = [];
        for(var i=0; i<this.items.length;i++){
            if(this.items[i]!= undefined && this.items[i].Name.includes(this.searchKey)){
                data.push(this.items[i]);
            }
        }
        this.processRecords(data);
    }

}