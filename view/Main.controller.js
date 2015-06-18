sap.ui.controller("view.Main", {
    
    mapView : null,
    listView : null,
    oModel : null,
    
    onInit : function(){
        this.oModel = new sap.ui.model.json.JSONModel();
		this.oModel.setData( { companies : [] } );
        sap.ui.getCore().setModel(this.oModel, "Companies"); 
    },
    
    onAfterRendering : function(){
        this.getView().setBusy(true);
        
        if(!this.mapView){
            this.mapView = sap.ui.view({viewName:"view.MapView", type:sap.ui.core.mvc.ViewType.XML});
            sap.ui.getCore().byId("mapServiceApp").addPage(this.mapView);
        }
        
        if(!this.listView){
            this.listView = sap.ui.view({viewName:"view.Split", type:sap.ui.core.mvc.ViewType.XML});
            sap.ui.getCore().byId("mapServiceApp").addPage(this.listView);
        }
        
        this.requestData();
    },
    
    requestData : function(){
        var that = this;
        
        var promise = $.ajax({
     	    url: "../model/Company.json",
     	    type: 'GET',
     	    contentType: "application/json"
     	});
    		
    	promise.done( function( aCompanies ){
            that.oModel.setData( { companies : aCompanies } );
            that.getView().setBusy(false);
		});
    },

    tileMapOnPress : function(){
        sap.ui.getCore().byId("mapServiceApp").to(this.mapView);
    },
    
    tileListOnPress : function(){
        sap.ui.getCore().byId("mapServiceApp").to(this.listView);
    }

});