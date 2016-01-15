//requires openlayers and proj4js
goog.provide('firesource');
goog.require("firesource.session");//creates global vars and shortcuts
goog.require("firesource.ui");
goog.require('firesource.forms');
goog.require("firesource.ol");

firesource.setupmap = function() {
    //build ui framework
    firesource.ui.renderMapControls();

    s.ol.bounds = new OpenLayers.Bounds(
                115.866, -38.242,
                132.001, -16.51
    );
    //firesource.ol.maps.gda94 takes a div and bounds
    s.ol.olmap = firesource.ol.maps.gda94(document.getElementById("map"), s.ol.bounds);
    s.ol.sldformat = new OpenLayers.Format.SLD.v1();
    s.ol.geojsonformat = new OpenLayers.Format.GeoJSON();
    $(window).resize(function() {
        firesource.ol.jiggleMap(s.ol.olmap);
    });

    //loading for ajax
    $.loading({onAjax:true, delay:100, pulse:'ellipsis'});
    var trackingUpdate = function() {
        $("li[itemid^=resource_tracking] a:contains(Refresh)").mouseup();
    }
    setInterval(trackingUpdate, 60000)

    //get layers & maps, probably should be renamed to static assets
    $.get('/apps/spatial/layers.json', function(data) {
        firesource.session.updateResults(data);
    });
}

//loads once dom is ready
$(document).ready(function() {
    //should detect divs and load appropriate js
    if ($('#map').length) {
        firesource.setupmap()
    } else {
        firesource.forms.decorate()
    }
});
