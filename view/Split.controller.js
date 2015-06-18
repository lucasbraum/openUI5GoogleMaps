sap.ui.controller("view.Split", {
    
    splitApp : null,
    masterView : null,
    detailView : null,

    onAfterRendering : function(){
        if(!this.splitApp){
            this.splitApp = this.getView().byId("idAppControl");
        }
        
        if(!this.masterView){
            this.masterView = sap.ui.view({viewName:"view.Master", type:sap.ui.core.mvc.ViewType.XML});
            this.splitApp.addMasterPage(this.masterView);
        }
        
        if(!this.detailView){
            this.detailView = sap.ui.view({viewName:"view.Detail", type:sap.ui.core.mvc.ViewType.XML});
            this.splitApp.addDetailPage(this.detailView);
        }
    }

});