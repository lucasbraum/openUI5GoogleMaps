sap.ui.controller("view.Detail", {
    
    inputEquip : null,
    textArea1 : null,
    textArea2 : null,
    

    onAfterRendering : function(){
    },
    
    createStartProgressButton : function(){
        
        var oFooter = this.getView().byId("detailPage").getFooter();
        var oButton = new sap.m.Button({
            text : "{i18n>startProgress}",
            press : this.startProgressFunction
        });
        
        oFooter.removeContent(1);
        oFooter.addContent(oButton);
    },
    
    startProgress : function(){
        sap.ui.getCore().getModel("selectedCompany").oData.Status = "In Progress";
        sap.ui.getCore().getModel("selectedCompany").refresh(true);
        sap.ui.getCore().getModel("Companies").refresh(true);
        
        var oFooter = this.getView().byId("detailPage").getFooter();
        oFooter.removeContent(1);
        var oButtonFinalize = new sap.m.Button({
            text : "Finish service",
            type: "Accept",
            press : this.finishService()
        });
        oFooter.addContent(oButtonFinalize);
    },
    
    finishService : function(){
        var that = this;
        var oVLayout = this.createDialogLayout();
        return function(){
            var dialog = new sap.m.Dialog({
              title: 'Finish service request',
              content: oVLayout,
                beginButton: new sap.m.Button({
                text: 'Finish',
                type: "Accept",
                press: function () {
                    dialog.setBusy(true);
                    that.createMaitenanceLog(that);
                    dialog.setBusy(false);
                    dialog.close();
                }
                }),
                afterClose: function() {
                }
                });
        
            //to get access to the global model
            that.getView().addDependent(dialog);
            dialog.open();
        };
    },
    
    createDialogLayout : function(){
        var oVLayout = new sap.ui.layout.VerticalLayout({ width: "100%" });
        
        this.inputEquip = new sap.m.Input({ width: "100%" });
        this.inputEquip.setPlaceholder("Equipment");
        
        this.textArea1 = new sap.m.TextArea({ width: "100%" });
        this.textArea1.setPlaceholder("Problem description");
        
        this.textArea2 = new sap.m.TextArea({ width: "100%" });
        this.textArea2.setPlaceholder("Solution");
        
        oVLayout.addContent(this.inputEquip);
        oVLayout.addContent(this.textArea1);
        oVLayout.addContent(this.textArea2);
        return oVLayout;
    },
    
    createMaitenanceLog : function(that){
            var oLog = {
                "Date": "05/12/2015",
    	        "Equipment": that.inputEquip.getValue(),
    	        "Description": that.textArea1.getValue(),
    	        "Solution": that.textArea2.getValue(),
    	        "Processor": "Lucas Braum"
            };
            
            sap.ui.getCore().getModel("selectedCompany").oData.maintenanceLog.push(oLog);
            sap.ui.getCore().getModel("selectedCompany").oData.Status = "Checked";
            sap.ui.getCore().getModel("selectedCompany").refresh(true);
            sap.ui.getCore().getModel("Companies").refresh(true);
            
            var oFooter = that.getView().byId("detailPage").getFooter();
            oFooter.removeContent(1);
    }
    
});