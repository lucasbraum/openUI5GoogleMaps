(function() {
                "use strict";
                
    jQuery.sap.declare("ServiceMapFiori.utils.Formatter");
    
    ServiceMapFiori.utils.Formatter = {
        
        status : function (sStatus) {
            if (sStatus === "Checked") {
                return "Success";
            } 
            if (sStatus === "In Progress") {
                return "Warning";
            } 
            if (sStatus === "Action Needed") {
                return "Error";
            }
            return "None";
        },
        
        addressListFormatter : function(sCity, sState, sZipcode){
            return sCity + ", " + sState + " " + sZipcode;
        }

        
    };
})();