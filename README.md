# Neighborhood Map project

## Project Description
You will develop a single-page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this application, including: map markers to identify popular locations or places you’d like to visit, a search function to easily discover these locations, and a listview to support simple browsing of all locations. You will then research and implement third-party APIs that provide additional information about each of these locations (such as StreetView images, Wikipedia articles, Yelp reviews, etc).

## How to Run
* Click on the index.html file
* Alternatively visit the <a href="http://jerryahames.github.io/P5-Neighborhood-Map/">github io</a> page

## Comments
There are several museums and great places to eat in my hometown. I selected several of these places as the locations I'd like to visit.

Clicking on an item in the list will make the item bold, and slightly bigger, and will select the marker in the map. The map marker will turn blue and the info window will popup with the title, a google streetview image, if it's available, and the short description from a wikipedia article, if it's available.

### Search
The user has the ability to search the list of locations by typing into the text box and either hitting the <Enter> key or clicking the [Filter] button. Filtering the list will remove any items that don't match the search criteria and removing the corresponding marker from the map.

To clear the filter, delete the text in the input box and press the <Enter> key or click [Filter] again.

The search will search the name of the location and the tags associated with each location (Food, or Museum for instance).

## Rubric
<a href="https://www.udacity.com/course/viewer#!/c-nd001/l-2711658591/m-2684328537">Rubric</a>

### Outside Resources
* <a href="https://developers.google.com/speed/pagespeed/insights/">Pagespeed Insights</a>
* <a href="https://github.com/udacity/fend-office-hours/tree/master/Web%20Optimization/Effective%20Optimizations%20for%2060%20FPS">Udacity Office Hours suggestions</a>
* Udacity: Intro to Ajax

* <a href="https://developer.foursquare.com/start">Foresquare API</a>
* <a href="http://www.mediawiki.org/wiki/API%3aMain_page">MediaWiki API for Wikipedia</a>
* <a href="https://developers.google.com/maps/documentation/javascript/streetview"> Google Maps Street View Service</a>
* <a href="https://developers.google.com/maps/documentation/">Google Maps Documentation</a>
* <a href="https://developers.google.com/maps/documentation/business/articles/usage_limits">Over_Query_Limit</a>
* <a href="http://getbootstrap.com/css/">Bootstrap Documentation</a>

* <a href="http://blog.outsharked.com/2013/05/adding-default-enter-key-handling-to.html">Knockout - Input submit on Enter Key documentation</a>
* <a href="http://www.javascriptkit.com/dhtmltutors/cssmediaqueries4.shtml">CSS media Queries in js</a>
* <a href="http://www.snyderplace.com/demos/collapsible.html">JQuery Collapsible</a>
