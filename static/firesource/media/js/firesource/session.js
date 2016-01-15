goog.provide('firesource.session');
goog.require('fssoy');

var s = {} //session object, should be a dict of everything! (except functions)
s.ui = {} //s.ui should be user interface vars
s.ui.dialogs = {} //s.ui.dialogs is floating dialogs
s.ui.menus = {} // menus
s.ui.buttons = {} // buttons
s.ui.states = {} // states
s.ol = {} //s.ol should be openlayers vars
s.ol.controls = {} //s.ol.controls should be openlayers controls
s.queries = {} //queries to send, named after e.target.getCaption()
s.callbacks = {} //callbacks to fire, named after e.target.getCaption()
s.results = {} //convenient place to store callback results
//jquery reverse
$.fn.reverse = [].reverse;

//jquery ajaxSetup override
$.ajaxSetup({
	'timeout': 30000
});

//sigfigs
var sigFigs = function(n, sig) {
	var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
	return Math.round(n * mult) / mult;
}

//escape css
var escapecss = function(text) {
	return text.replace(/(:|\.)/g, '\\$1');
}

var timezoneDate = function(utcisostring) {
    return new Date(Date.parse(utcisostring) - (new Date().getTimezoneOffset()) * 60 * 1000)
}

//jquery fromxml
jQuery.fromXMLString = function(strXML) {
	if (window.DOMParser) {
		return jQuery(new DOMParser().parseFromString(strXML, "text/xml"));
	} else if (window.ActiveXObject) {
		var doc = new ActiveXObject("Microsoft.XMLDOM");
		doc.async = "false";
		doc.loadXML(strXML);
		return jQuery(doc);
	} else {
		return jQuery(strXML);
	}
};

//session callbacks
s.callbacks.resourcegroups = function(data) { //needs moving to ui
	$('#resources-div-west ul.list').empty().append(fssoy.listTags({
		"items": data
	}));
}


s.callbacks.layergroups = function(data) {
	$('div#layers-div-west .list').append(fssoy.listTags({
		items: data
	}));
	$('input#layersearchtext').keyup();
}

s.callbacks.layers = function(data) {
    var ullayers = $('ul#layers')
	// add layers to session map
	firesource.ol.populateLayers(s.ol.olmap, data, s.ol.layers);

	//save and restore are for future when user updates layer inside session
	//firesource.ui.saveLayerState();
	ullayers.empty();
	$.each(data, function(index, layer) {
		if (layer.latest_data) {
			layer.latest_data = dateFormat(timezoneDate(layer.latest_data), "dd/mm/yyyy HH:MM");
		} else {
			if (layer.details.updated) {
				layer.latest_data = layer.details.updated;
			} else {
				layer.latest_data = 'Unknown';
			}
		}
		layer.refreshable = true;
		if (layer.details.updated != 'Live') {
			layer.refreshable = false;
		}
		if (layer.type[0] != "_" && layer.type != "vectortemplate") {
			ullayers.append(fssoy.layerItem({
				item: layer
			}));
		}
	});

	if (!s.ui.states.built) {
		firesource.ol.buildMap();
	}

	firesource.ui.restoreLayerState();

	if (!s.ui.states.navigationHistoryActive) {
		s.ol.olmap.addControl(s.ol.navigationHistory);
		s.ol.olmap.addControl(s.ol.navigationHistory.next);
		s.ol.olmap.addControl(s.ol.navigationHistory.previous);
		s.ol.navigationHistory.jump = function(direction, times) {
			for (i = 0; i < times; i++) {
				var stack = s.ol.navigationHistory[direction + "Stack"];
				// make sure history traversal is actually shifting view
				while (stack[1] && stack[0].center.lon == stack[1].center.lon && stack[0].center.lat == stack[1].center.lat && stack[0].resolution == stack[1].resolution) {
					s.ol.navigationHistory[direction + "Trigger"]();
				}
				s.ol.navigationHistory[direction + "Trigger"]();
			}
		}
		s.ui.states.navigationHistoryActive = true;
	}
	s.ol.olmap.addControl(s.ol.controls.mouseposition);
    $('div#views-div-west').find('a:contains(Saved)').click()
    firesource.ol.loadState(null, function() {
        if (django_query.layersearch) {
            $('input#layersearchtext').val(django_query.layersearch[0]).keyup();
        } else {
            $('input#layersearchtext').keyup();
        }
        s.ol.olmap.events.on({
            zoomend: firesource['ol']['mapZoomEnd'],
            moveend: firesource['ol']['saveState'],
            changelayer: firesource['ol']['saveState'],
            changebaselayer: firesource['ol']['saveState']
        });
        s.ol.olmap.events.triggerEvent("zoomend");
    });
}

s.callbacks.maps = function(data) {
    var ulviews = $('ul#views');
    ulviews.empty();
	$.each(data, function(index, view) {
        ulviews.append(fssoy.viewItem({"item":view}));
		s.ol.userviews[view["map_id"]] = view
	});
}

firesource.session.updateResults = function(data) {
	//updates results array with keys, and fires function for each key
	$.each(data, function(key, value) {
		s.results[key] = value;
		s.callbacks[key](s.results[key]);
	});
}


