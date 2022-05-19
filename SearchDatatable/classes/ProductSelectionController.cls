/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-16-2022
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class ProductSelectionController {
    public ProductSelectionController() {
        
    }


    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts( String searchKey, String sortBy, String sortDirection, String filters){
       
        String query = 'SELECT Id, Name, ProductCode, Description FROM Product2 ';

        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE (Name LIKE :key';
            query += ' OR ProductCode LIKE :key )';
            if ( filters != null && filters != '' ) {
                query += ' AND '+filters;
                system.debug('FILTERS =========>'+filters);
            }
    
        } else if ( filters != null && filters != '' ) {
            query += ' WHERE '+filters;
            system.debug('FILTERS =========>'+filters);
        }

        if ( sortBy != null && sortDirection != null ) {
            query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
        }
        system.debug('QUERY =======>'+query);

        //query = query + ' LIMIT 10';
        return Database.query( query );
    }
}