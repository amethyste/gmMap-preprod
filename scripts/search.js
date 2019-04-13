var findMarkers = function(place, radius) {
  var markersFound = [];

  for (var marker of markers) {
    var targetLat = marker.getPosition().lat();
    var targetLng = marker.getPosition().lng();
    var centerLat = place.geometry.location.lat();
    var centerLng = place.geometry.location.lng();

    var targetLoc = new google.maps.LatLng(targetLat,targetLng);
    var centerLoc = new google.maps.LatLng(centerLat, centerLng);

    var distanceInkm = (google.maps.geometry.spherical.computeDistanceBetween(centerLoc, targetLoc) / 1000).toFixed(2);

    if(distanceInkm <= radius){
      markersFound.push(marker);
    }
  }

  return markersFound;
}

var fillResults = function(place) {
  var bounds = new google.maps.LatLngBounds();
  var radiusList = [25, 50, 100];
  var i = 0;

  do {
    searchMarkersByGmap = findMarkers(place, radiusList[i]);
    i++;
  } while(searchMarkersByGmap.length === 0 && i < radiusList.length)

  combineFilters(searchMarkersByFilters, searchMarkersByGmap);

  if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
  } else {
    bounds.extend(place.geometry.location);
  }

  map.fitBounds(bounds);
  map.setZoom(11);
  map.panBy(-150, 0);
}

 var inputSearchbar = document.querySelector('#searchbar input');
 var options = {
    types: ['(cities)'],
    componentRestrictions: {country: 'fr'}
 };

 var autocomplete = new google.maps.places.Autocomplete(inputSearchbar, options);
 autocomplete.bindTo('bounds', map);

 google.maps.event.addDomListener(inputSearchbar, 'keydown', function(event) {
   if (event.keyCode === 13) {
     event.preventDefault();
   }
 });

 google.maps.event.addDomListener(inputSearchbar, 'focus', function(event) {
   inputSearchbar.value = "";
   searchMarkersByGmap = [];
   combineFilters(searchMarkersByFilters, searchMarkersByGmap);
 });

 google.maps.event.addListener(autocomplete, 'place_changed', function(event) {
    var place = autocomplete.getPlace();
    searchMarkersByGmap = [];

    if (!place.formatted_address) {
      autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
          {
              'input': place.name,
              'offset': place.name.length,
              'componentRestrictions': {'country': 'fr'},
              'types': ['(cities)']
          },
          function listentoresult(list, status) {
            var firstResult = list[0];
            inputSearchbar.value = firstResult.description;

            var request = {
              placeId: firstResult.place_id,
              fields: ['geometry']
            };

            var service = new google.maps.places.PlacesService(map);
            service.getDetails(request, function(place, status){
              fillResults(place);
            });
          });
    } else {
      fillResults(place);
    }
  });
