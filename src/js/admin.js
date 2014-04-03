function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(54.525961, 15.255119), //change to match a default set in the params
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 5,
    panControl: 0,
    zoomControl: 0,
    mapTypeControl: 0,
    scaleControl: 0,
    streetViewControl: 0,
    overviewMapControl: 0
  };
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

//******************map size***********************//
function updateMapTypeSize(){
  var mapWidth = jQuery('#jform_params_mapwidth').val();
  var mapHeight = jQuery('#jform_params_mapheight').val();
  var animateMap = jQuery('#map').animate({width : mapWidth, height : mapHeight});
  jQuery.when.apply(this, animateMap).done(function() {
    //console.log('width:' + mapWidth);
    google.maps.event.trigger(map,'resize'); 
  });
  //TODO add a warning if the map is set to be larger than the current div
}
//update on pageload to get param values
updateMapTypeSize();
//update when inputs are changed and delay a little bit so it's not jumping around
jQuery('#jform_params_mapwidth,#jform_params_mapheight').on('keyup keypress blur change', function() {
  setTimeout(updateMapTypeSize,500);
});
//******************end map size*******************//

//******************map centre***********************//
function updateMapCentre(lat,lng){
  map.setCenter(new google.maps.LatLng(lat, lng));
}
//update centre on pageload
var latInput = parseFloat(jQuery('#jform_params_mapcentlat').val());
var lngInput = parseFloat(jQuery('#jform_params_mapcentlon').val());
updateMapCentre(latInput, lngInput);

function updateCentreFields(lat,lng){
  var latLng = map.getCenter();
  lat = typeof lat !== 'undefined' ? lat : latLng.lat();
  lng = typeof lng !== 'undefined' ? lng : latLng.lng();
  jQuery('#jform_params_mapcentlat').val(lat);
  jQuery('#jform_params_mapcentlon').val(lng);
}
//update values when map is dragged
google.maps.event.addListener(map, 'dragend', function(event){
  updateCentreFields();
  google.maps.event.trigger(map,'resize');
});
//update the map when the values are changed
jQuery('#jform_params_mapcentlat,#jform_params_mapcentlon').on('keyup keypress blur change', function() {
  var newlatlng = new google.maps.LatLng(jQuery('#jform_params_mapcentlat').val(), jQuery('#jform_params_mapcentlon').val());
  map.panTo(newlatlng);
});
//find the location of an address
var geocoder = new google.maps.Geocoder();
function geocodeAddress(location) {
  geocoder.geocode( { 'address': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      updateCentreFields();
    }
    else
    {
    //console.log('some problem in geocode' + status);
  }
});
}
//set the centre when using the search
jQuery('#jform_params_mapsearch').on('keyup', function() {
  geocodeAddress(jQuery('#jform_params_mapsearch').val());
});
//******************end map centre*******************//

//******************maptype***********************//
function updateMapType(){
  var selectedmaptype = jQuery('#jform_params_maptype').val();
  var mapStyle = jQuery('#jform_params_mapcustomstyle').val();
  if (mapStyle === '') {
    map.setOptions({styles: null});
    jQuery('#mapstylewarning').html('');
  } else {
    if (IsJsonString(mapStyle)) {
      var mapStyle = JSON.parse(mapStyle);
      map.setOptions({styles: mapStyle});
      jQuery('#mapstylewarning').hide().html('').fadeIn('slow');
    } else {
      map.setOptions({styles: null});
      jQuery('#mapstylewarning').hide().html('<div class="alert alert-error">The style is not valid JSON</div>').fadeIn('slow');
      //console.log('map style is not valid JSON string');
    }
  };
  if (selectedmaptype === 'SATELLITE') {
    map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
  } else if (selectedmaptype === 'HYBRID') {
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
  } else if (selectedmaptype === 'TERRAIN') {
    map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
  } else {
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  }
} 
//update type on pageload
updateMapType();
//update type on input change
jQuery('#jform_params_maptype').change(updateMapType);
jQuery('#jform_params_mapcustomstyle').bind('input propertychange', 'input,textarea', function() {
  updateMapType();
});
//update input on map change
google.maps.event.addListener( map, 'maptypeid_changed', function() { 
  jQuery('#jform_params_maptype').val(map.getMapTypeId().toUpperCase());
  jQuery('#jform_params_maptype_chzn span').text(map.getMapTypeId());
} );
//update style from preset
jQuery('#jform_params_mappresets').change(function() {
  if (jQuery(this).val() == -1 || jQuery(this).val() == '') {
    jQuery('#jform_params_mapcustomstyle').val('');
    map.setOptions({styles: null});
  }else{
    jQuery.ajax({
      url: window.siteRoot + 'modules/mod_jbmaps2/presets/' + jQuery('#jform_params_mappresets').val() + '.json',
      context: document.body,
      contentType: "application/json",
      dataType: "text",
      success: function(style){
        if (IsJsonString(style)) {
          jQuery('#jform_params_mapcustomstyle').val(style);
          map.setOptions({styles: JSON.parse(style)});
        }else{
          jQuery('#mapstylewarning').hide().html('<div class="alert alert-error">The file contents are not valid JSON</div>').fadeIn('slow');
          map.setOptions({styles: null});
        };
      }
    });
  };
  
});
//******************end maptype*******************//

//******************controls***********************//
jQuery('.checkboxes.jbmaps2-mapcontrols').on('change', ':checkbox', function(){
  map.set(jQuery(this).val(), this.checked ? true : false);
});
//check option on pageload
jQuery('.checkboxes.jbmaps2-mapcontrols :checkbox').each(function(){
  map.set(jQuery(this).val(), this.checked ? true : false);
});
//******************end controls*******************//

//******************zoom***********************//
function updateMapZoom(){
  var selectedmapzoom = parseInt(jQuery('#jform_params_mapzoom').val());
  map.setZoom(selectedmapzoom);
}
//set zoom on pageload
updateMapZoom();
//update on zoom select change
jQuery('#jform_params_mapzoom').change(updateMapZoom);
//update zoom select on map zoom
google.maps.event.addListener(map,'zoom_changed',function () {
  jQuery('#jform_params_mapzoom').val(map.getZoom());
  jQuery('#jform_params_mapzoom_chzn span').text(map.getZoom());
}); 
//******************end zoom*******************//

//******************tilt***********************//
function updateMapTilt(tilt){
  map.setTilt(parseInt(tilt));
}
//set on pageload
updateMapTilt(jQuery('#jform_params_maptilt').val());
//update on field change
jQuery('#jform_params_maptilt').change(function(){
  updateMapTilt(jQuery('#jform_params_maptilt').val());
});
//need to add map listener here
//******************end tilt*******************//

//******************heading***********************//
function updateMapHeading(heading){
  map.setHeading(parseInt(heading));
}
//set on pageload
updateMapHeading(jQuery('#jform_params_mapheading').val()); 
//update on field change   
jQuery('#jform_params_mapheading').change(function(){
  updateMapHeading(jQuery('#jform_params_mapheading').val());
});
//update hield on map change
google.maps.event.addListener(map,'heading_changed',function () {
  jQuery('#jform_params_mapheading').val(parseInt(map.getHeading()));
  jQuery('#jform_params_mapheading_chzn span').text(map.getHeading());
});
//******************end heading*******************//

//******************drag***********************//
jQuery('#jform_params_mapdraggable').click(function(){
  map.set('draggable',jQuery('#jform_params_mapdraggable input[type=radio]:checked').val());
});
//set on pageload
map.set('draggable',jQuery('#jform_params_mapdraggable input[type=radio]:checked').val());
//******************end drag*******************//

//******************weather layer***********************//
var weatherLayer = new google.maps.weather.WeatherLayer({
  temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS,
  windSpeedUnits: google.maps.weather.WindSpeedUnit.METERS_PER_SECOND,
  labelColor: google.maps.weather.LabelColor.BLACK
});
function updateMapWeather(){
  weatherLayer.setMap(parseInt(jQuery('#jform_params_mapweatherlayer input[type=radio]:checked').val()) ? map : null);
 // updateTemperature(jQuery('#jform_params_mapweatherunits input[type=radio]:checked').val());
 // updateWind(jQuery('#jform_params_mapwindunits option:selected').val());
 // updateLabelColor(jQuery('#jform_params_mapweatherlabels option:selected').val() == 0 ? null : jQuery('#jform_params_mapweatherlabels option:selected').val());
}
function updateTemperature(units){
  console.log(units);
  weatherLayer.setOptions({'temperatureUnits': units});
}
function updateWind(units){
  console.log(units);
  weatherLayer.setOptions({'windSpeedUnits': units});
}
function updateLabelColor(color) {
  weatherLayer.setOptions({'labelColor': color});
}

jQuery('#jform_params_mapweatherlayer').click(function(){
  if (parseInt(jQuery('#jform_params_mapweatherlayer input[type=radio]:checked').val())) {
    weatherLayer.setMap(map);
    jQuery('#jform_params_mapweatherunits').closest('.control-group').show(500);
    jQuery('#jform_params_mapwindunits').closest('.control-group').show(500);
    jQuery('#jform_params_mapweatherlabels').closest('.control-group').show(500);
  }else{
    weatherLayer.setMap(null);
    jQuery('#jform_params_mapweatherunits').closest('.control-group').hide(500);
    jQuery('#jform_params_mapwindunits').closest('.control-group').hide(500);
    jQuery('#jform_params_mapweatherlabels').closest('.control-group').hide(500);
  };
});
//check if we need to hide fields on pageload
if (parseInt(jQuery('#jform_params_mapweatherlayer input[type=radio]:checked').val())) {
  jQuery('#jform_params_mapweatherunits').closest('.control-group').show(500);
  jQuery('#jform_params_mapwindunits').closest('.control-group').show(500);
  jQuery('#jform_params_mapweatherlabels').closest('.control-group').show(500);
}else{
  jQuery('#jform_params_mapweatherunits').closest('.control-group').hide(500);
  jQuery('#jform_params_mapwindunits').closest('.control-group').hide(500);
  jQuery('#jform_params_mapweatherlabels').closest('.control-group').hide(500);
};
//toggle units
jQuery('#jform_params_mapweatherunits').click(function(){
  if (jQuery('#jform_params_mapweatherunits input[type=radio]:checked').val() === 'google.maps.weather.TemperatureUnit.CELSIUS') {
    updateTemperature(google.maps.weather.TemperatureUnit.CELSIUS);
  } else if (jQuery('#jform_params_mapweatherunits input[type=radio]:checked').val() === 'google.maps.weather.TemperatureUnit.FAHRENHEIT') { 
    updateTemperature(google.maps.weather.TemperatureUnit.FAHRENHEIT);
  };
});
jQuery('#jform_params_mapwindunits').change(function(){
  if (jQuery('#jform_params_mapwindunits option:selected').val() === 'google.maps.weather.WindSpeedUnit.KILOMETERS_PER_HOUR') {
    updateWind(google.maps.weather.WindSpeedUnit.KILOMETERS_PER_HOUR);
  } else if (jQuery('#jform_params_mapwindunits option:selected').val() === 'google.maps.weather.WindSpeedUnit.METERS_PER_SECOND') {
    updateWind(google.maps.weather.WindSpeedUnit.METERS_PER_SECOND);
  } else if (jQuery('#jform_params_mapwindunits option:selected').val() === 'google.maps.weather.WindSpeedUnit.MILES_PER_HOUR') {
    updateWind(google.maps.weather.WindSpeedUnit.MILES_PER_HOUR);
  };
});
jQuery('#jform_params_mapweatherlabels').change(function(){
  if (jQuery('#jform_params_mapweatherlabels option:selected').val() === '0') {
    updateLabelColor(null);
  } else if (jQuery('#jform_params_mapweatherlabels option:selected').val() === 'google.maps.weather.LabelColor.BLACK') {
    updateLabelColor(google.maps.weather.LabelColor.BLACK);
  } else if (jQuery('#jform_params_mapweatherlabels option:selected').val() === 'google.maps.weather.LabelColor.WHITE') {
    updateLabelColor(google.maps.weather.LabelColor.WHITE);
  };
});
//set on pageload
updateMapWeather();
weatherLayer.setOptions({'labelColor': jQuery('#jform_params_mapweatherlabels option:selected').val() == 0 ? null : jQuery('#jform_params_mapweatherlabels option:selected').val()});
//console.log(jQuery('#jform_params_mapweatherlabels option:selected').val() == 0 ? null : jQuery('#jform_params_mapweatherlabels option:selected').val());
//map.set('weatherLayer',jQuery('#jform_params_mapweatherlayer input[type=radio]:checked').val());
//******************end weather layer*******************//

//******************cloud layer ***********************//
var cloudLayer = new google.maps.weather.CloudLayer();
cloudLayer.setMap(parseInt(jQuery('#jform_params_mapcloudlayer input[type=radio]:checked').val()) ? map : null);
jQuery('#jform_params_mapcloudlayer').click(function(){
  cloudLayer.setMap(parseInt(jQuery('#jform_params_mapcloudlayer input[type=radio]:checked').val()) ? map : null);
});
//******************end cloud layer*******************//

//******************traffic layer***********************//
var trafficLayer = new google.maps.TrafficLayer();
trafficLayer.setMap(parseInt(jQuery('#jform_params_maptrafficlayer input[type=radio]:checked').val()) ? map : null);
jQuery('#jform_params_maptrafficlayer').click(function(){
  trafficLayer.setMap(parseInt(jQuery('#jform_params_maptrafficlayer input[type=radio]:checked').val()) ? map : null);
});
//******************end traffic layer*******************//

//******************transit layer***********************//
var transitLayer = new google.maps.TransitLayer();
transitLayer.setMap(parseInt(jQuery('#jform_params_maptransitlayer input[type=radio]:checked').val()) ? map : null);
jQuery('#jform_params_maptransitlayer').click(function(){
  transitLayer.setMap(parseInt(jQuery('#jform_params_maptransitlayer input[type=radio]:checked').val()) ? map : null);
});
//******************end transit layer*******************//

//******************bicycling layer***********************//
var bikeLayer = new google.maps.BicyclingLayer();
bikeLayer.setMap(parseInt(jQuery('#jform_params_mapbicyclinglayer input[type=radio]:checked').val()) ? map : null);
jQuery('#jform_params_mapbicyclinglayer').click(function(){
  bikeLayer.setMap(parseInt(jQuery('#jform_params_mapbicyclinglayer input[type=radio]:checked').val()) ? map : null);
});
//******************end bicycling layer*******************//

//******************kml layer*******************//
function updateKml(){
  kmlfile = jQuery('#jform_params_mapkmllayer').val();
  var kmlLayer = new google.maps.KmlLayer();
  kmlLayer.setMap(null); //this isn't removing the layer
  //console.log('kml file: ' + kmlfile);
  if (kmlfile !== '') {
    //console.log('update url');
    kmlLayer.setOptions({'url': kmlfile});
    kmlLayer.setMap(map);
  };
}
jQuery('#jform_params_mapkmllayer').focusout(function(){
  updateKml();
});
//check for kml on load
updateKml();
//******************end kml layer*******************//

//****************** *******************//
//******************end *******************//

//****************** *******************//
//******************end *******************//

//******************markers***********************//
//Global marker array
var markers = [];
//add a new marker
google.maps.event.addListener(map, 'click', function(event) {
  addMarker(event.latLng);
});
// Add a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
    markerid: markers.length,
    position: location,
    title: '',
    icon: 'http://maps.google.com/mapfiles/marker.png',
    shadow: 'http://maps.google.com/mapfiles/shadow50.png',
    windowcontent: '',
    draggable: true,
    map: map
  });
  markers.push(marker);
  updateFieldsFromMap(markers);
  //update on drag
  google.maps.event.addListener(marker, 'dragend', function(event) {
    updateFieldsFromMap();
  });
  //remove on dbl click
  google.maps.event.addListener(marker, 'dblclick', function(event) {
    var x = confirm('Delete this Marker?' + this.markerid);
    if(x){
      this.setMap(null);
      id = this.markerid;
      if (markers.length === 1) {
        markers = [];
      }else{
        markers.splice(id,1);
      };
      updateFieldsFromMap();
    }
  });
}
// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function updateFieldsFromMap(){
  markerArray = [];
  markerHtml = '';
  if (markers.length) {
    for (var i=0; i<markers.length; i++) {
      markerid = markers[i].markerid;
      lat = markers[i].getPosition().lat();
      lng = markers[i].getPosition().lng();
      title = markers[i].getTitle();
      icon = markers[i].getIcon();
      shadow = markers[i].getShadow();
      windowcontent = markers[i].windowcontent;
      markerInfo = [markerid,lat,lng,title,icon,shadow,windowcontent];
      markerArray.push(markerInfo);
    //create the fields with the information
    /*jshint multistr: true */
    markerHtml += '<fieldset class="form" id="markerfieldset' + markerid +'" data-type="markerfieldset">\
    <legend>Marker ' + markerid  + '</legend>\
    <input data-type="markerid" type="hidden" value="' + markerid +'">\
    <label>Title</label>\
    <input class="input" data-type="markertitle" type="text" value="' + title +'">\
    <label>Text</label>\
    <textarea data-type="markerwindowcontent" rows="3">' + windowcontent + '</textarea>\
    <label>Icon</label>\
    <input class="input" data-type="markericon" type="text" value="' + icon +'"><img class="markericon" src="' + icon +'" />\
    <label>Icon Shadow</label>\
    <input class="input" data-type="markericonshadow" type="text" value="' + shadow +'"><img class="markericonshadow" src="' + shadow +'" />\
    <label class="hidden">Lat:</label>\
    <input class="input-mini hidden" data-type="markerlat" type="text" value="' + lat +'">\
    <label class="hidden">Lng:</label>\
    <input class="input-mini hidden" data-type="markerlng" type="text" value="' + lng +'">\
    <button data-marker-id="' + markerid  + '" class="btn btn-mini btn-danger removemarker" type="button"><i class="icon-remove"></i>Delete Marker</button>\
    </fieldset>';
  }
    //add marker helper butttons
    /*jshint multistr: true */
    markerHelpers = '<fieldset class="form-inline">\
    <a class="btn btn-mini btn-danger removeallmarkers" data-type="deleteallmarkers">Remove all markers</a>\
    <a class="btn btn-mini btn-primary fitmarkers" data-type="fitmarkersmarkers">Fit Map to Markers</a>\
    </fieldset>';
    document.getElementById('markerhelpers').innerHTML = markerHelpers;
  } else {
    document.getElementById('markerhelpers').innerHTML = '';
  };
  //update the hidden field
  jQuery('input#jform_params_markerdata').val(JSON.stringify(markerArray));
  //update the fields
  document.getElementById('markers').innerHTML = markerHtml;
}
function updateMapFromFields(){
  deleteMarkers();
  markerArray = [];
  //update the hidden field from forms if they exist
  if (jQuery('fieldset[data-type="markerfieldset"]').length) {
    jQuery('fieldset[data-type="markerfieldset"]').each(function(i){
      lat = parseFloat(jQuery(this).find('input[data-type="markerlat"]').val());
      lng = parseFloat(jQuery(this).find('input[data-type="markerlng"]').val());
      title = jQuery(this).find('input[data-type="markertitle"]').val();
      icon = jQuery(this).find('input[data-type="markericon"]').val();
      shadow = jQuery(this).find('input[data-type="markericonshadow"]').val();
      windowcontent = jQuery(this).find('textarea[data-type="markerwindowcontent"]').val();
      markerInfo = [i,lat,lng,title,icon,shadow,windowcontent];
      markerArray.push(markerInfo);    
    });
    jQuery('input#jform_params_markerdata').val(JSON.stringify(markerArray));
  };
  //use the hidden field to update markers
  if (jQuery('input#jform_params_markerdata').val() !== '') {
    savedMarkers = JSON.parse(jQuery('input#jform_params_markerdata').val())
    for (i = 0; i < savedMarkers.length; i++) {
    //console.debug(savedMarkers[i]); 
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(savedMarkers[i][1], savedMarkers[i][2]),
      markerid: savedMarkers[i][0],
      title: savedMarkers[i][3],
      icon: savedMarkers[i][4],
      shadow: savedMarkers[i][5],
      windowcontent: savedMarkers[i][6],
      draggable: true,
      map: map
    });
    markers.push(marker);
    //remove on dbl click
    google.maps.event.addListener(marker, 'dblclick', function(event) {
      var x = confirm('Delete this Marker?' + this.markerid);
      if(x){
        this.setMap(null);
        id = this.markerid;
        if (markers.length === 1) {
          markers = [];
        }else{
          markers.splice(id,1);
        };
        updateFieldsFromMap();
      }
    });
  //update on drag
  google.maps.event.addListener(marker, 'dragend', function(event) {
    updateFieldsFromMap();
  });
  //info windows
  var infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
    return function() {
      if (this.windowcontent !== '') {
        if (infowindow.getMap(this)) {
          infowindow.close(map, marker);
          console.log('closing');
        }else{
          infowindow.setContent(this.windowcontent);
          infowindow.open(map, marker);
          console.log('opening');
        };
      };
    }
  })(marker, i));
  
}
};
}
//update markers when editing fields
jQuery('#markers').on('keyup keypress change', 'input,textarea', function() {
  updateMapFromFields();
});
//update markers when one is deleted with button
jQuery('#markers').on('click', '.btn.removemarker', function(){
  var x = confirm('Delete this Marker?');
  if(x){
    fieldset = '#markerfieldset' + jQuery(this).data('marker-id');
    jQuery(fieldset).remove();
    if (jQuery('fieldset[data-type="markerfieldset"]').length === 0) {
      jQuery('input#jform_params_markerdata').val('[]');
    };
    updateMapFromFields();
  }
});
//add markers on pageload
if(jQuery('input#jform_params_markerdata').val() !== ''){
  updateMapFromFields();
  updateFieldsFromMap();
}
//change icon when clicking the image
jQuery('#markers').on('click', 'img.markericon', function(){
  jQuery(this).prev('input').val('changed');
});
//******************end markers*******************//

//******************marker helper buttons***********************//
//remove all
jQuery('#markerhelpers').on('click', '.btn.removeallmarkers', function(){
  var x = confirm('Delete all Markers? (This cannot be undone!)');
  if(x){
    deleteMarkers();
    updateFieldsFromMap();
  }
});
//fit to markers
jQuery('#markerhelpers').on('click', '.btn.fitmarkers', function(){
  var LatLngList = [];
  for (var i=0; i<markers.length; i++) {
    lat = markers[i].getPosition().lat();
    lng = markers[i].getPosition().lng();
    LatLngList.push(new google.maps.LatLng (lat,lng));
  };
  var bounds = new google.maps.LatLngBounds ();
  for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
    bounds.extend (LatLngList[i]);
  }
  map.fitBounds (bounds);
});
//******************end marker helper buttons*******************//

//******************re-initalize on tab click***********************//
/*[].forEach.call(document.querySelectorAll('ul.nav-tabs li'), function(el) {
  el.addEventListener('click', function() {
    setTimeout(function(){ initialize(); }, 100);
  });
});*/
jQuery('ul.nav-tabs li').click(function() {
  setTimeout(function(){ google.maps.event.trigger(map,'resize');}, 100);
});
//******************end re-initalize on tab click*******************//

} //end initalize

//******************general functions***********************//
// encode(decode) html text into html entity
function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// check for valid json
function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
// get site url
function getURL() { 
  var arr = window.location.href.split("/"); 
  //delete arr[arr.length - 1]; 
  return arr[2]; 
}
//******************end general functions*******************//

google.maps.event.addDomListener(window, 'load', initialize);

jQuery(window).load(function() {
  if (localStorage.getItem('tab-href')) {
    //tab state is saved so need to delay the resize
    setTimeout(function(){ google.maps.event.trigger(map,'resize');}, 220);
  } else {
    setTimeout(function(){ google.maps.event.trigger(map,'resize');}, 100);
  }
});