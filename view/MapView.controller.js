sap.ui.controller("view.MapView", {

    oMap : null,
    geocoder : null,
    directionsDisplay : null,
    directionsService : null,
    oRoute: null,
    oDestinationMarker : null,
    oDestinationAddress : null,
    aWayPoints : [],
    aWayPointsAddresses : [],
    aInfowindows : [],

    onAfterRendering : function(){
        if(!this.oMap){
            this.initMap();
        } else {
            this.loadDataFromModel();
        }
        
        //$(window).trigger('resize');
    },
    
    backButton : function(){
        sap.ui.getCore().byId("mapServiceApp").back();  
    },
    
    initMap: function(){
        var mapOptions = {
            center: new google.maps.LatLng(37.4, -122.1),
            zoom: 12,  
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
            
        this.oMap = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(),  mapOptions);
        this.geocoder = new google.maps.Geocoder(); 
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({draggable: true, map: this.oMap, suppressMarkers:true});
        
        this.createCurrentLocationMarker();
        this.loadDataFromModel();
    },
    
    loadDataFromModel : function(){
        var that = this;
        var aCompanies = sap.ui.getCore().getModel("Companies").getData().companies;
        
        jQuery.each(aCompanies, function(index, oCompany){
           that.createMapMarker(oCompany, index);
        });
    },
    
    createCurrentLocationMarker : function(){
        var marker = new google.maps.Marker({
            position: this.oMap.getCenter(),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                strokeWeight: 2,
                fillOpacity: 1,
                fillColor: "#00afe9",
                strokeColor : "#ffffff"
            },
            drop: true,
            map: this.oMap
        });
    },
    
    createMapMarker : function(oCompany, index){
        var that = this;
        var address = oCompany.Address + ", " + oCompany.City + ", " + oCompany.Country;
        
        this.geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                
                var contentString = that.createInfoWindowContent(oCompany, index);
                
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                infowindow.oBtnsLayout = new sap.ui.layout.HorizontalLayout({});
                
                var marker;
                if (oCompany.Status === "Action Needed"){
                    marker = that.generateMarker("../assets/imgs/map-marker-red.png", results);
                } else if (oCompany.Status === "In Progress"){
                    marker = that.generateMarker("../assets/imgs/map-marker-yellow.png", results);
                } else {
                    marker = that.generateMarker("../assets/imgs/map-marker-green.png", results);
                }
                
                google.maps.event.addListener(marker, 'click', function() {
                    that.closeAllInfowindows();
                    infowindow.open(that.oMap, marker);
                    if (!infowindow.hasBtnLayoutRendered){
                        infowindow.oBtnsLayout.placeAt("infoWindowButton" + index)
                    }
                    
                    infowindow.oBtnsLayout.destroyContent();
                    if (!that.oRoute){
                        infowindow.oBtnsLayout.addContent( that.createInfoWindowStartRouteButton( address, marker ) );
                    } else if (that.oRoute && that.oDestinationMarker === marker){
                        infowindow.oBtnsLayout.addContent( that.createInfoWindowEndRouteButton() );
                    } else if (that.oRoute && jQuery.inArray(address, that.aWayPointsAddresses) === -1){
                        infowindow.oBtnsLayout.addContent( that.createInfoWindowAddToRouteButton( address ) );
                    } else if (that.oRoute && jQuery.inArray(address, that.aWayPointsAddresses) !== -1) {
                        infowindow.oBtnsLayout.addContent( that.createInfoWindowRemoveFromRouteButton( address ) );
                    }
                });
                
                that.aInfowindows.push(infowindow);
                
            } else {
                console.log("address not found by Google Maps - " + address);
            }
        });
    },
    
    generateMarker : function(sIconUrl, results){
        return new google.maps.Marker({
                position: results[0].geometry.location,
                map: this.oMap,
                icon: sIconUrl,
                animation: google.maps.Animation.DROP
            });
    },
    
    createInfoWindowContent : function(oCompany, index){
        var statusClass = oCompany.Status.replace(/\s/g, '');
        var contentString = '<div id="content">'+
              '<div id="siteNotice">'+
              '</div>'+
              '<h1 id="firstHeading" class="firstHeading">'+ oCompany.Name +'</h1>'+
              '<div id="bodyContent">'+
              '<label class="' + statusClass + '"><b>'+ oCompany.Status +'</b></label><br/>' +
              '<p>'+ oCompany.Address +'<br/>' + 
              oCompany.City + ", " + oCompany.State + " " + oCompany.ZipCode +'</p>'+
              '</div><div id="infoWindowButton' + index + '"></div>'+
              '</div>';
        return contentString;
    },
    
    createRoute : function(that, destinationAddress, marker){
        
        return function(){
            var request = {
                origin: new google.maps.LatLng(37.4, -122.1),
                destination: destinationAddress,
                waypoints : that.aWayPoints,
                travelMode: google.maps.TravelMode.DRIVING
            };
            
            that.directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    that.directionsDisplay.setDirections(result);
                    that.oRoute = result;
                    that.oDestinationAddress = destinationAddress;
                    if (marker){
                        that.oDestinationMarker = marker;
                    }
                    that.closeAllInfowindows();
                }
            });
        };
        
    },
    
    endRoute : function(that){
        
        return function(){
            that.oRoute = null;
            that.aWayPoints = [];
            that.aWayPointsAddresses = [];
            that.oDestinationMarker = null;
            that.oDestionationAddres = null;
            that.directionsDisplay.set('directions', null);
            that.directionsDisplay.setPanel(null);
            that.closeAllInfowindows();
        };
    },
    
    addToRoute : function(that, address){
        
        return function(){
            that.aWayPoints.push({location : address});
            that.aWayPointsAddresses.push(address);
            that.createRoute(that, that.oDestinationAddress)();
        };
    },
    
    removeFromRoute : function(that, address){
        
        return function(){
            var index = that.aWayPointsAddresses.indexOf(address);
            that.aWayPoints.splice(index, 1);
            that.aWayPointsAddresses.splice(index, 1);
            that.createRoute(that, that.oDestinationAddress)();
        };
    },
    
    openRouteDetails : function(){
        var that = this;
        var btn = this.getView().byId("routeDetailsBtn");
            
        function openPopover(){
            jQuery.sap.delayedCall(0, this, function () {
                that._oPopover.openBy(btn);
            });
        }
            
        //alert se nao tiver rota ainda
        if(!this.oRoute){
            var sMsg = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("toastNoRoute");
            sap.m.MessageToast.show(sMsg);
        } else {
            // create popover
            if (!that._oPopover) {
                that._oPopover = sap.ui.xmlfragment("view.routeDetailsPopover", that);
                // delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
                jQuery.sap.delayedCall(0, that, function () {
                    that._oPopover.openBy(btn);
                    that.getView().addDependent(that._oPopover);
                    var routePanel = sap.ui.getCore().byId("routeDetailsPanel").getDomRef();
                    that.directionsDisplay.setPanel(routePanel);
                    that._oPopover.close();
                });
                openPopover();
            } else {
                openPopover();
            }
        }
    },
    
    createInfoWindowStartRouteButton : function( address, marker, infowindow ){
        return new sap.m.Button({
            text : "{i18n>startRoute}",
            press : this.createRoute(this, address, marker, infowindow)
        });
    },
    
    createInfoWindowEndRouteButton : function( infowindow ){
        return new sap.m.Button({
            text : "{i18n>endRoute}",
            press : this.endRoute(this, infowindow)
        });
    },
    
    createInfoWindowAddToRouteButton : function( address, infowindow ){
        return new sap.m.Button({
            text : "{i18n>addRoute}",
            press : this.addToRoute(this, address, infowindow)
        });
    },
    
    createInfoWindowRemoveFromRouteButton : function( address, infowindow ){
        return new sap.m.Button({
            text : "{i18n>removeFromRoute}",
            press : this.removeFromRoute(this, address, infowindow)
        });
    },
    
    closeAllInfowindows : function(){
        jQuery.each(this.aInfowindows, function(_, oInfowindow){
           oInfowindow.close(); 
        });
    }
    
});