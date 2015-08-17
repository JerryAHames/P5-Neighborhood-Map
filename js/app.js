/********\
| Models |
\*******/
var Location = function(name, street, city){
  var self = this;
  this.Name = ko.observable(name);
  this.street = ko.observable(street);
  this.city = ko.observable(city);
  this.marker = ko.observable(null);
  this.Address = ko.computed(function() {
    return self.street() + ", " + self.city();
  });
}
var GoogleStuff = {
  Map: null,
  Markers: []
}

/*******\
| Views |
\******/
var viewSearch = {
  init: function() {

  },
  render: function() {

  }
}
var viewMap = {
  init: function () {

  },
  render: function() {

  }
}
/************\
| ViewModels |
\***********/

var ViewModel = function() {
  var self = this;
  this.locations = ko.observableArray([]);
  this.geocoder = new google.maps.Geocoder();

  this.addLocations = function() {
    self.locations().push(new Location("Kimbell Art Museum", "3333 Camp Bowie Boulevard", "Fort Worth"));
    self.locations().push(new Location("Amon Carter Museum of American Art", "3501 Camp Bowie Blvd", "Fort Worth"));

    self.locations().push(new Location("Modern Art Museum of Fort Worth", "3200 Darnell Street", "Fort Worth"));
    self.locations().push(new Location("Fort Worth Zoo", "1989 Colonial Pkwy", "Fort Worth"));
    self.locations().push(new Location("Sundance Square", "Sundance Square", "Fort Worth"));
    self.locations().push(new Location("Water Gardens", "1502 Commerce St", "Fort Worth"));
    for(var i = 0; i < self.locations().length; i++) {
      self.addMarkerForAddress(self.locations()[i].Address());
    }
  };

  GoogleStuff.Map = new google.maps.Map(document.getElementById('map'), {
      disableDefaultUI: true,
      zoom: 14,
      //center: {lat: -34.397, lng: 150.644},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    this.updateCurrentLocation = function(loc) {
      self.currentLocation(loc);
      self.addMarkerForAddress(self.currentLocation().Address());
    }
  this.addMarkerForAddress = function(address) {
    self.geocoder.geocode({'address': address}, function(results, status) {

      if(status === google.maps.GeocoderStatus.OK) {
        GoogleStuff.Map.setCenter(results[0].geometry.location);

        self.addMarker(address, results[0].geometry.location);
      }});
  };

  this.locationCallBack = function(results, status) {

    if(status === google.maps.GeocoderStatus.OK) {
      GoogleStuff.Map.setCenter(results[0].geometry.location);

      self.addMarker(results[0].geometry.location);
    }
  };

  this.addMarker = function(address, location) {
    var marker = new google.maps.Marker({
      map: GoogleStuff.Map,
      position: location
    });
    //for(var i = 0; i < GoogleStuff.Markers.length; i++) {
    //  if(self.locations[i].Address() === address) {
    //    self.locations[i].marker(marker);
    //      break;
    //  }
    //}
    for(var i = 0; i < GoogleStuff.Markers.length; i++)
    {
      GoogleStuff.Markers[i].setMap(null);
    }
    GoogleStuff.Markers = [];
    GoogleStuff.Markers.push(marker);
  };

  this.deleteMarker = function(marker) {
    for(var i = 0; i < GoogleStuff.Markers.length; i++)
    {
      if(marker === GoogleStuff.Markers[i])
      {
        var before = GoogleStuff.Markers.splice(i, 1);
      }
    }
  };

  this.showMarker = function(marker) {

  }

  this.addLocations();

  this.currentLocation = ko.observable(this.locations()[0]);

}



ko.applyBindings(new ViewModel());
