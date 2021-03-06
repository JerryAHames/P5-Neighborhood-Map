'use strict';
/********\
| Models |
\*******/
var Location = function(name, street, city, tags) {
    var self = this;
    this.Name = ko.observable(name);
    this.Street = ko.observable(street);
    this.City = ko.observable(city);
    this.Marker = ko.observable(null);
    this.Address = ko.computed(function() {
        return self.Street() + ", " + self.City();
    });
    this.Visible = ko.observable(true);
    this.Tags = ko.observableArray(tags);
    this.Selected = ko.observable(false);
    this.InfoWindow = ko.observable(null);
    this.WikiText = ko.observable("");
    this.Wiki = {
        Text: ko.observable(""),
        URL: ko.observable("")
    };
    this.ToolTip = ko.computed(function() {
        var toReturn = "";
        for (var i = 0; i < self.Tags().length; i++)
            toReturn = toReturn + "|" + self.Tags()[i];
        return toReturn;
    });
};
/************\
| ViewModels |
\***********/

var ViewModel = function() {
    var self = this;
    this.WikipediaAPIURL = "http://en.wikipedia.org/w/api.php?action=opensearch&search=$name$&format=json&callback=wikiCallback";

    this.locations = ko.observableArray([]); //Array of all the locations we have.
    this.currentLocation = ko.observable(null); //Setup the current location
    this.Filter = ko.observable(""); //Set up the filter
    this.MenuOpen = ko.observable(false);
    this.IsMobileLayout = ko.observable(false);
    this.$Collapsible = $('.collapsible');
    this.$Window = $(window);
    this.geocoder = new google.maps.Geocoder(); //This is used by google maps to find the lat / long of a search.

    this.map = new google.maps.Map(document.getElementById('map'), { //This is the actual google maps object.
        disableDefaultUI: true, //Turn off the google maps UI so that I can create my own.
        zoom: 14, //Zoom to about city level.
        mapTypeId: google.maps.MapTypeId.ROADMAP //I want a road map. Not a satellite or something.
    });

    //There are two pins. The selected pin and the default pin. The default pin is very similar
    //to the default google maps pin, but is a little smaller. I overwrite the default pin so that
    //I can have the default and selected pins styled the same, just different colors.
    var defaultPin = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + "FE7569",
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));
    //The selected pin is the same size as the default pin, but is a different color. This allows me
    //to hilight the currently selected location.
    var selectedPin = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + "3366ff",
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));

    //Add all the various locations to visit
    this.addLocations = function() {
        //Create a new location object for each location and store it into my array.
        self.locations().push(new Location("Kimbell Art Museum", "3333 Camp Bowie Boulevard", "Fort Worth", ["museum", "art"]));
        self.locations().push(new Location("Amon Carter Museum of American Art", "3501 Camp Bowie Blvd", "Fort Worth", ["museum", "art", "western"]));
        self.locations().push(new Location("Fort Worth Museum of Science and History", "1600 Gendy St", "Fort Worth", ["museum", "childrens"]));
        self.locations().push(new Location("Modern Art Museum of Fort Worth", "3200 Darnell Street", "Fort Worth", ["museum", "art", "modern"]));

        self.locations().push(new Location("Fort Worth Zoo", "1989 Colonial Pkwy", "Fort Worth", ["zoo"]));

        self.locations().push(new Location("Sundance Square", "Sundance Square", "Fort Worth", ["free"]));
        self.locations().push(new Location("Water Gardens", "1502 Commerce St", "Fort Worth", ["free"]));

        self.locations().push(new Location("Rodeo Goat", "2836 Bledsoe St", "Fort Worth", ["food", "burgers"]));
        self.locations().push(new Location("Terra Mediterranean Grill", "2973 Crockett St", "Fort Worth", ["food", "mediterranean"]));
        self.locations().push(new Location("Daybreak Cafe & Grill", "2720 White Settlement Rd", "Fort Worth", ["food", "burger"]));
        self.locations().push(new Location("Reata Restaurant", "310 Houston Street", "Fort Worth", ["food", "texan"]));
        self.locations().push(new Location("Blue Mesa Grill", "1600 S University Dr", "Fort Worth", ["food", "mexican"]));
        var count = 0;

        //Build the marker for each location.
        for (var i = 0; i < self.locations().length; i++) {
            self.AddMarker(self.locations()[i], count);

            if (i % 3 === 0)
                count++; //see comment in AddMarker for count's purpose
        }
    };

    //Ask the maps API for data on the location.
    //location: The location you're requesting.
    //timeMult: the amount of time to wait before sending the request.
    this.AddMarker = function(location, timeMult) {
        //Google maps' api was returning an OverQueryLimit status when I sent more than
        //11 messages at a time. Use some closures and settimeout to space the requests
        //out a little bit to avoid this.
        //The callback will also try to re-request markers if I do get the OverQueryLimit
        //error. This is just the first step in handling the error.
        var f = function(loc) {
            return function() {
                self.addMarkerForAddress(loc);
            };
        };
        setTimeout(f(location), 200 * timeMult);
    };

    //When the user clicks on an item in the list box, update the currently selected location.
    this.updateSelectedLocation = function(loc) {
        //First, if we already have an old selected location, deselect it.
        //Then Lets close the info window.
        if (self.currentLocation() !== null && self.currentLocation().Marker() !== null) {
            //When we close the old location, we don't want to show the info window anymore.
            if (self.currentLocation().InfoWindow() !== null)
                self.currentLocation().InfoWindow().close();

            //Turn the marker for the old current location back to the original marker.
            self.currentLocation().Marker().setIcon(defaultPin);
            self.currentLocation().Selected(false);
        }
        //Update the current location.
        self.currentLocation(loc);
        //If there is a current location, lets select it and display the info window.
        if (loc !== null && loc.Marker() !== null) {
            //Update the marker for the new current location.
            self.currentLocation().Marker().setIcon(selectedPin);
            self.currentLocation().Selected(true);
            //Lets display the info window for the selected map point.
            self.currentLocation().InfoWindow().open(self.map, self.currentLocation().Marker());
        }
    };

    //Lets apply the filter.
    this.filterSelectedLocations = function() {
        var filter = self.Filter().toLowerCase();

        //Let's check the list of locations and toggle visibility.
        for (var i = 0; i < self.locations().length; i++) {
            this.ApplyFilter(filter, self.locations()[i]);
        }
        self.MenuOpen(true);

        //Let's open the collapsible list.
        self.$Collapsible.collapsible('openAll');
    };

    //Lets apply the filter to each individual location.
    this.ApplyFilter = function(filter, loc) {
        var vis = false;
        //Check the name first.
        if (loc.Name().toLowerCase().indexOf(filter) !== -1)
            vis = true;
        else {
            //Let's check all the tags.
            for (var j = 0; j < loc.Tags().length; j++) {
                if (loc.Tags()[j].toLowerCase().indexOf(filter) !== -1) {
                    vis = true;
                    break;
                }
            }
        }

        //Show or hide as necessary
        loc.Visible(vis);
        if (loc.Selected() === true)
            self.updateSelectedLocation(null);
        //If the location is not visible, hide the marker.
        if (loc.Marker() !== null)
            loc.Marker().setVisible(vis);
    };

    this.addMarkerForAddress = function(loc) {
        //Lets ask the geocoder for the data we need to plot the marker
        self.geocoder.geocode({
            'address': loc.Address()
        }, function(results, status) {
            //The data came back ok, lets create a marker.
            if (status === google.maps.GeocoderStatus.OK) {
                if (self.locations()[0].Name == loc.Name)
                    self.map.setCenter(results[0].geometry.location);

                loc.Marker(new google.maps.Marker({
                    map: self.map,
                    position: results[0].geometry.location,
                    icon: defaultPin
                }));

                // infoWindows are the little helper windows that open when you click
                // or hover over a pin on a map. They usually contain more information
                // about a location.
                loc.InfoWindow(new google.maps.InfoWindow({
                    content: '<h3>' + loc.Name() + '</h3><img src="$imgurl$"><br />$wiki$',
                    maxWidth: 250
                }));

                // This code adds text to the map marker when the pin is clicked.
                google.maps.event.addListener(loc.Marker(), 'mousedown', function() {
                    self.updateSelectedLocation(loc);
                });

                //Filter the results just in case a new marker comes in and shouldn't be
                //visible.
                self.ApplyFilter(self.Filter().toLowerCase(), loc);
                self.LoadWikiArticle(loc);
            }
            //We tried to get too many items at once. Lets try again in about 1 s.
            //Google restricts the number of requests you can make within a
            //short amount of time.
            else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                self.AddMarker(loc, 10);
            }
        });
    };

    //If this is a small screen the list of locations is hidden. This will slide
    //the list of locations into view. This should happen when the user clicks the
    //hamburger icon.
    this.MenuClick = function() {
        self.MenuOpen(!self.MenuOpen());
        if (self.MenuOpen() !== false && self.IsMobileLayout() === true)
            self.$Collapsible.collapsible("closeAll");
        else
            self.$Collapsible.collapsible("openAll");
    };
    //If this is a small screen don't show the list of locations always. If it's
    //visible we need a way to make it disappear again.
    this.MainClick = function() {
        self.MenuOpen(false);
        if (self.IsMobileLayout() === true)
            self.$Collapsible.collapsible("closeAll");
    };

    this.LoadWikiArticle = function(loc) {

        var finalURL = self.WikipediaAPIURL.replace("$name$", loc.Name());
        var wikiRequestTimeout = setTimeout(function() {
            loc.WikiText.text("failed to get wikipedia resources");
        }, 8000);
        $.ajax({
            url: finalURL,
            dataType: 'jsonp',
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                clearTimeout(wikiRequestTimeout);

                if (data[2][0] !== null && data[2][0] !== undefined) {
                    loc.Wiki.Text(data[2][0]);
                    loc.Wiki.URL(data[3][0]);
                } else {
                    loc.Wiki.Text("No Wikipedia entry available");
                }
                loc.InfoWindow().content = loc.InfoWindow().content.replace("$imgurl$", self.GetStreetViewImage(loc)).replace("$wiki$", loc.Wiki.Text()).replace("$wikiurl$", loc.Wiki.URL());
            },
            //We've failed to find a wikipedia entry. That's ok, some of these places are probably pretty great.
            //Let's just say there isn't a wikipedia entry and move along.
            error: function() {
                clearTimeout(wikiRequestTimeout);

                loc.Wiki.Text("No Wikipedia entry available");

                loc.InfoWindow().content = loc.InfoWindow().content.replace("$imgurl$", self.GetStreetViewImage(loc)).replace("$wiki$", loc.Wiki.Text()).replace("$wikiurl$", loc.Wiki.URL());
            },
            fail: function() {
                clearTimeout(wikiRequestTimeout);

                loc.WikiText("No Wikipedia entry available");

                loc.InfoWindow().content = loc.InfoWindow().content.replace("$imgurl$", self.GetStreetViewImage(loc)).replace("$wiki$", loc.Wiki.Text()).replace("$wikiurl$", loc.Wiki.URL());
            },
        });
    };
    this.GetStreetViewImage = function(loc) {
        if (self.IsMobileLayout() === false)
            return 'https://maps.googleapis.com/maps/api/streetview?size=200x200&location=' + loc.Marker().position + '';
        return '';
    };

    //Add all the default locations.
    this.addLocations();

    //Lets do some setup for the collapsible menu.
    //If we're in the smaller, mobile layout, lets set that flag.
    if (self.$Window.width() < 499)
        self.IsMobileLayout(true);

    //Set up the collapsible menu
    self.$Collapsible.collapsible({
        speed: 200,
        defaultOpen: 'filterResults'
    });
    //When we hit our media query break points, switch between mobile / standard.
    window.matchMedia("screen and (max-width: 499px)").addListener(function(mql) {
        if (mql.matches)
            self.IsMobileLayout(true);
    });
    window.matchMedia("screen and (min-width: 500px)").addListener(function(mql) {
        if (mql.matches) {
            self.IsMobileLayout(false);
            self.$Collapsible.collapsible('openAll');
        }
    });

};

//As a user enhancement, lets allow the user to hit the "Enter" key from the
//filter text box to filter the list of locations. To do that we need to add
//our own binding handler to knockout.
ko.bindingHandlers.enterkey = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {

        var inputSelector = 'input';
        //When the user presses a key, on an input in the document run this
        //function.
        $(document).on('keypress', inputSelector, function(e) {

            var allBindings = allBindingsAccessor();
            var keyCode = e.which || e.keyCode;
            if (keyCode !== 13) { //13 is the enter key. So if it's not 13, continue.
                return true;
            }

            var target = e.target;
            target.blur(); //Take focus away from the input box.

            //Lets call the function in the view model.
            allBindings.enterkey.call(viewModel, viewModel, target, element);

            return false;
        });
    }
};
ko.applyBindings(new ViewModel());
