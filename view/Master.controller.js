jQuery.sap.require("ServiceMapFiori.utils.Formatter");

sap.ui.controller("view.Master", {
    
    aItems : null,
    
    onInit : function(){
        // declare a global model to be used by the Detail.view
        var oSelectedCompanyModel = new sap.ui.model.json.JSONModel({});
        sap.ui.getCore().setModel(oSelectedCompanyModel, "selectedCompany"); 
    },
    
    onAfterRendering : function(){
        this.selectFirstItem();
    },
    
    backButton : function(){
        sap.ui.getCore().byId("mapServiceApp").back();  
    },
    
    onSelect : function(oEvent) {
        var that = this;
		// Get the list item either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode)
	    var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
		jQuery.each(this.aItems, function(index, obj){
		    if(oItem === obj){
		        var oCompany = sap.ui.getCore().getModel("Companies").getData().companies[index];
    		    sap.ui.getCore().getModel("selectedCompany").setData( oCompany );
		        return false;
		    }
		});
		
	},
    
    onSearch : function() {
		// Add search filter
		var filters = [];
		var searchString = this.getView().byId("searchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [ new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchString) ];
		}
		// Update list binding
		this.getView().byId("list").getBinding("items").filter(filters);
		
		//On phone devices, there is nothing to select from the list
		if (sap.ui.Device.system.phone) {
			return;
		}
	},
	
    selectFirstItem : function() {
		var oList = this.getView().byId("list");
		this.aItems = oList.getItems();
		if (this.aItems.length) {
			oList.setSelectedItem(this.aItems[0], true);
			var oCompany = sap.ui.getCore().getModel("Companies").getData().companies[0];
    		sap.ui.getCore().getModel("selectedCompany").setData( oCompany );
		}
	}

});