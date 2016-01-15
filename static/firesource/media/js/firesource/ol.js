goog.require('firesource.session');
goog.require('firesource.ol.loadingpanel');
goog.provide('firesource.ol');

/*
	Contains functions for resource tracking project
	that use the openlayers controls and interact with
	the vector features
*/

s.ol.controls = {}; //openlayers controls
s.ol.symbolizers = {}; //symbolizers stored in session
s.ol.styles = {}; //openlayers styles
s.ol.styleMaps = {}; //openlayers styleMaps
s.ol.layers = {}; //openlayers layers
s.ol.layers.vector = {}; //vector based layers
s.ol.layers.vectoroverlay = {}; //vector overlay layers (unselectable)
s.ol.layers.point = {}; //point imagery layers
s.ol.layers.line = {}; //line imagery layers
s.ol.layers.polygon = {}; //poly imagery layers
s.ol.layers.overlay = {}; //poly imagery layers
s.ol.layers.imagery = {}; //imagery/base, only one at a time layers
s.ol.userviews = {};

firesource.ol.interact = {}; //interactive controls
firesource.ol.events = {}; //like actions but for events?
firesource.ol.maps = {}; //maps

OpenLayers.Control.Inspect = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions
        );
    },

    trigger: function(e) {
        if (s.inspect) { s.inspect(e.xy); }
    }

});

$.ajaxSetup({
  xhrFields: {
    withCredentials: true
  }
});

firesource.ol.updateLayer = function(features, layer, ollayer) {
	//show the layers being updated
	listitem = $("ul#layers").find("li.listitem[itemid=" + layer.id + "]");
	listitem.find("span.latest_data").text("...");
	//update layer
	ollayer.destroyFeatures();
	ollayer.addFeatures(features);
	ollayer.redraw();
	var latest_data = timezoneDate(jLinq.from(jLinq.from(features).select(function(r) {
		return r.attributes
	})).orderBy("-logged_time").select(function(r) {
		return r.logged_time
	})[0]);
	// update latest data time
	listitem.find("span.latest_data").text(dateFormat(latest_data, "dd/mm/yyyy HH:MM"));
	// rebuild vectors tab
	s.ui.states.vectorsBuilt = false;
	$("select#vectors-select").change();
}

firesource.ol.buildHistory = function(layer, features) {
	if (s.ol.layers.vector.history && s.ol.layers.vector.history_lines) {
		s.ol.layers.vector.history.destroy();
        delete s.ol.layers.vector.history;
		s.ol.layers.vector.history_lines.destroy();
        delete s.ol.layers.vector.history_lines;
	}
    s.ol.layers.vector.history = new OpenLayers.Layer.Vector("history", {
        strategies: [new OpenLayers.Strategy.Cluster({
            distance: 16,
            threshold: 2
        })]
    });
    // add to layers list & move to underneath s.ol.activeVector
    s.ol.layers.vector.history_lines = new OpenLayers.Layer.Vector("history_lines");
    var history_layer = s.ol.layers.vector.history;
    var history_lines_layer = s.ol.layers.vector.history_lines;
    s.ol.olmap.addLayer(history_lines_layer);
    s.ol.olmap.addLayer(history_layer);
	s.ol.olmap.setLayerIndex(history_layer, s.ol.historyLayerIndex);
	s.ol.olmap.setLayerIndex(history_lines_layer, s.ol.historyLayerIndex);
	s.ol.olmap.resetLayersZIndex();
	lineFeatures = [];
	var unique = "attributes." + layer.unique;
	$.each(jLinq.from(s.results.vectorHistory).distinct(unique), function(index, id) {
		var points = []
		var curpoint = [firesource.ol.getFeaturesBy(unique, s.ol.activeVector, id)[0].geometry];
		$.merge(points, curpoint);
		$.merge(points, jLinq.from(features).equals(unique, id).select(function(r) {
			return r.geometry;
		}));
		var lineString = new OpenLayers.Geometry.LineString(points);
		lineFeatures.push(new OpenLayers.Feature.Vector(lineString));
	});
	history_layer.addFeatures(features);
	history_lines_layer.addFeatures(lineFeatures);
	history_layer.setVisibility(true);
	history_lines_layer.setVisibility(true);
	if (layer.style_history) {
		var style = layer.style_history;
	} else {
		var style = layer.style;
	}
	$.get('//static.dpaw.wa.gov.au/static/firesource/static/styles/' + style + '.xml', function(data) {
		var styles = s.ol.sldformat.read(data).namedLayers
        s.hstyles = styles;
		if (styles["default"]) {
			defaultstyle = styles["default"].userStyles[0];
			history_layer.styleMap.styles["default"] = defaultstyle;
			history_lines_layer.styleMap.styles["default"] = defaultstyle;
		}
		history_layer.redraw();
		history_lines_layer.redraw();
	});
}

firesource.ol.buildVectorLayer = function(layer, layerType) {
	if (layer.cluster) {
		layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id, {
			strategies: [new OpenLayers.Strategy.Cluster({
				distance: layer.cluster,
				threshold: 2
			})]
		});
	} else {
		layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id);
	}
	var ollayer = layerType[layer.id]
	ollayer.search_filters = layer.filters;
    $.get('//static.dpaw.wa.gov.au/static/firesource/static/styles/' + layer.style + '.xml', function(data) {
        var styles = s.ol.sldformat.read(data).namedLayers
        if (styles["default"]) {
            defaultstyle = styles["default"].userStyles[0];
            if (defaultstyle.rules[0].name == "Cluster") {
                defaultstyle.rules[0].symbolizer.Point.label = "${count}";
                defaultstyle.rules[0].symbolizer.Point.fontSize = 10;
                defaultstyle.rules[0].symbolizer.Point.fontWeight = "bold";
                delete defaultstyle.rules[0].symbolizer.Text;
            }
            ollayer.styleMap.styles["default"] = defaultstyle;
        }
        if (styles["select"]) {
            selectstyle = styles["select"].userStyles[0];
            if (selectstyle.rules[0].name == "Cluster") {
                selectstyle.rules[0].symbolizer.Point.label = "${count}";
                selectstyle.rules[0].symbolizer.Point.fontSize = 10;
                selectstyle.rules[0].symbolizer.Point.fontWeight = "bold";
                delete selectstyle.rules[0].symbolizer.Text;
            }
            ollayer.styleMap.styles["select"] = selectstyle;
        }
        ollayer.redraw();
    });
	ollayer.query_vector = function() {
		if (layer.unsaved) {
			return;
		};
        s.ol.loading_view = true;
        ollayer.events.triggerEvent("loadstart");
        $.get('/apps/spatial/query_vector/' + layer.query + '.json', function(data) {
            if (layer) {
                firesource.ol.updateLayer(s.ol.geojsonformat.read(data), layer, ollayer);
            }
            s.ol.loading_view = false;
            ollayer.events.triggerEvent("loadend");
        });
	}

	ollayer.query_history = function(datefrom, dateto, selectedVectors) {
		$.post('/apps/spatial/query_vector/' + layer.query + '.json', JSON.stringify({
			"from_date": datefrom,
			"to_date": dateto,
			"unique_list": selectedVectors
		}), function(data) {
			s.results.vectorHistory = s.ol.geojsonformat.read(data);
			firesource.ol.buildHistory(layer, s.results.vectorHistory);
		});
	}

	return ollayer
}

firesource.ol.populateLayers = function(olmap, layers, root) {
	// use reverse to make sure openlayers adds layers in visibility order
	var lyrs = layers.slice(0);
	lyrs.reverse();
	$.each(lyrs, function(index, layer) {
		if (layer.type == "vectortemplate") {
			return;
		}
		if (layer.type.search("vector") > - 1) {
			ollayer = firesource.ol.buildVectorLayer(layer, root[layer.type]);
		} else {
            root[layer.type][layer.id] = eval(fssoy.ollayerwms(layer));
			ollayer = root[layer.type][layer.id];
		}
		olmap.addLayer(ollayer);
		if (layer.shown) {
			ollayer.shown = true;
		} else {
			ollayer.setVisibility(false);
		}
	});
}

firesource.ol.getFeaturesBy = function(field, layer, featureid) {
	var features = jLinq.from(layer.features).contains(field, featureid).select();
	if (features.length != 1) { // if cluster check inside cluster attributes
		$.each(layer.features, function(index, f) {
			$.merge(features, jLinq.from(f.cluster).contains(field, featureid).select());
			if (features.length == 1) {
				return false;
			}
		});
	}
	return features;
}

firesource.ol.jiggleMap = function(map) {
	if (map.getCenter()) {
        map.updateSize();
        firesource.ol.saveState();
		return true;
	} else {
		return false;
	}
}

firesource.ol.mapZoomEnd = function(e) {
	$('#vectors li.listitem input[id^="toggle-"]:checked').change();
	s.ui.zoomslider.children(".slider").slider("value", s.ol.olmap.zoom);
	$('div#hoverdetails').hide();
}

firesource.ol.currentState = function(extraLayers) {
	var layerlist = jLinq.from(s.ol.olmap.layers).equals("visibility", true).select()
	var printablelayers = [];
	$.each(layerlist, function(index, value) {
		if (value.name.slice(0, 11) != "OpenLayers." && value.name.slice(0,7) != "history") {
			if (value.opacity === null) {
				value.opacity = 1
			};
			printablelayers.push({
				"layer_id": value.name,
				"opacity": value.opacity
			});
		}
		return true;
	});
    if (extraLayers && extraLayers.length > 0) {
        $.each(extraLayers, function(index, layer) {
            printablelayers.push(layer);
            return true;
        });
    }
    center = s.ol.olmap.getCenter()
	return {
		"layers": printablelayers,
		"center": {"type":"Point","coordinates":[center.lon, center.lat]},
		"scale": Math.round(s.ol.olmap.getScale())
	}
}

firesource.ol.saveState = function(e, callback) {
    if (e) { var layers = e.layers; } else { var layers = false; }
    if (!s.ol.loading_view && s.loaded) {
        s.saved_state = JSON.stringify(firesource.ol.currentState(layers));
        localStorage.setItem("ss", s.saved_state);
        document.location.hash = $.param({"ss": s.saved_state });
        if (callback) { callback(); }
        return true;
    } else {
        return false;
    }
}

firesource.ol.loadState = function(e, callback) {
    var tempview, hashview, localview;
    tempview = hashview = localview = false;
    if (document.location.hash.length > 10) {
        var hashview = decodeURIComponent(document.location.hash.slice(1)).slice(3); }
    if (localStorage.getItem("ss")) {
        var localview = localStorage.getItem("ss"); }
    if (hashview && localview && hashview != localview) {
        if (window.confirm("Load state from url? If you cancel the map will return to your previous state.")) {
            tempview = hashview; } else { 
            tempview = localview; } } else {
        tempview = hashview || localview;
    }
    if (tempview) {
        tempview = JSON.parse(tempview);
        s.ol.loading_view = false;
        firesource.ol.loadView(tempview);
    }
    s.loaded = true;
    if (callback) { callback(); }
    return true;
}

window.addEventListener("hashchange", function () {
    var hashview = decodeURIComponent(document.location.hash.slice(1)).slice(3);
    var localview = localStorage.getItem("ss");
    if (hashview != localview) {
        if (window.confirm("Load state from url?")) {
            firesource.ol.loadView(JSON.parse(decodeURIComponent(document.location.hash.slice(1)).slice(3)));
        }
    }
}, false);

firesource.ol.loadView = function(viewobject) {
    if (s.ol.loading_view || viewobject == null) {
        return false
    }
    s.ol.loading_view = true;
    layers = $('ul#layers')
    //uncheck all layers
    layers.find('input[type!=radio][id^=toggle-]:checked').prop("checked", false).change();

    var maxIndex = 0;
    $.each(viewobject.layers, function(index, layer) {
        //turn on layer
        var ollayer = s.ol.olmap.getLayersByName(layer.layer_id);
        if (ollayer.length != 1) { return true; } else { ollayer = ollayer[0]; }
        if (s.ol.olmap.getLayerIndex(ollayer) < maxIndex) {
            maxIndex += 1;
            s.ol.olmap.setLayerIndex(ollayer, maxIndex);
            // should also update sortables position
        }
        layers.find('li[itemid=' + layer.layer_id + '] input[id^=toggle-]').prop('checked', true).change();
        //update opacity
        ollayer.setOpacity(layer.opacity);
        layers.find('li[itemid=' + layer.layer_id + '] div[id^=slider-]').slider("value", layer.opacity * 100);
    });
    s.ol.olmap.resetLayersZIndex();
    if (viewobject.type != "theme" && s.ol.olmap.baseLayer) {
        s.ol.olmap.zoomToScale(viewobject.scale);
        var center = new OpenLayers.LonLat(viewobject.center.coordinates[0], viewobject.center.coordinates[1]);
        s.ol.olmap.setCenter(center);
    }
    s.ol.loading_view = false;
    return true
}


firesource.ol.maps.overMap = function(selector) {
    divsize = new OpenLayers.Size($(selector).width(),$(selector).height())
	return new OpenLayers.Control.OverviewMap({
		div: $(selector)[0],
        size: divsize,
		autoPan: true,
		mapOptions: {
		    projection: new OpenLayers.Projection("EPSG:4326"),
			tileSize: new OpenLayers.Size(1024, 1024),
            resolutions: [0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.433227539062E-4, 1.716613769531E-4, 8.58306884766E-5, 4.29153442383E-5, 2.14576721191E-5, 1.07288360596E-5, 5.3644180298E-6, 2.6822090149E-6, 1.3411045074E-6]
		}
	})
}

firesource.ol.maps.gda94 = function(div, bounds) {
    OpenLayers.DOTS_PER_INCH = 90.71428571428572;
	var options = {
		controls: [],
		projection: new OpenLayers.Projection("EPSG:4326"),
        maxExtent: new OpenLayers.Bounds(-180.0,-90.0,180.0,90.0),
		tileSize: new OpenLayers.Size(1024, 1024),
        resolutions: [0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.433227539062E-4, 1.716613769531E-4, 8.58306884766E-5, 4.29153442383E-5, 2.14576721191E-5, 1.07288360596E-5, 5.3644180298E-6, 2.6822090149E-6, 1.3411045074E-6],
		units: 'degrees',
        fractionalZoom: false
	};
	olmap = new OpenLayers.Map(div, options);

	s.ol.controls.mouseposition = new OpenLayers.Control.MousePosition({
		element: $('#mouseposition')[0],
        formatOutput: function(lonLat) {
            lon = OpenLayers.Util.getFormattedLonLat(lonLat.lon, "lon", "dms")
            lat = OpenLayers.Util.getFormattedLonLat(lonLat.lat, "lat", "dms")
            return lon + ", " + lat + "</br><span>" + lonLat.lon + ", " + lonLat.lat + "</span>"
        }
	});
	olmap.addControl( new OpenLayers.Control.ScaleLine({geodesic: true}));
	olmap.addControl( new OpenLayers.Control.Scale());
	olmap.addControl(new OpenLayers.Control.LoadingPanel());
	return olmap;
}

firesource.ol.buildMap = function() {
	//static layers
	s.ol.olmap.zoomToExtent(s.ol.bounds);
	//other controls
	s.ol.olmap.addControl(s.ol.controls.navigate);
	s.ol.olmap.addControl(s.ol.controls.measureLine);
	s.ol.olmap.addControl(s.ol.controls.measureArea);
    s.ol.inspect = new OpenLayers.Control.Inspect();
    s.ol.olmap.addControl(s.ol.inspect);
    s.ol.inspect.activate();
	s.ui.states.built = true;
	$('#controlpan').click();
}

firesource.ol.hoverdetails = function(feature) {
	hoverdetails = $("div#hoverdetails")
	map = $("div#map")
	if (feature === null || ! feature.geometry.bounds.centerLonLat) {
		hoverdetails.hide();
		return;
	} else {
		var attributes = feature.attributes;
		featurex = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).x;
		featurey = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).y;
		attributes.logged_time_str = dateFormat(timezoneDate(attributes.logged_time), "dd/mm/yyyy HH:MM");
        attributes.symboltext = attributes.symbol.split("/")[1].replace(/_/g, " ")
		var content = fssoy.resourcedetaildiv({
			"item": attributes
		});
		hoverdetails.empty().append(content).show();
		var hoverx = hoverdetails.width();
		var hovery = hoverdetails.height();
		var posx = 0;
		var posy = 0;
		if (featurex + hoverx > map.width() - 50) {
			posx = featurex - hoverx - 30;
		} else {
			posx = featurex + 30;
		}
		if (featurey - hovery < 25) {
			posy = featurey + 30;
		} else {
			posy = featurey - hovery - 30;
		}
		hoverdetails.css({
			"top": posy,
			"left": posx
		});
	}
}

firesource.ol.events.select = function(feature, state) {
	if (!feature) {
		return
	}
	var vectors = $('ul#vectors');
	if (s.ol.activeVector.selectedFeatures.length == 0 && state === false) {
		vectors.find("li.listitem").find("input[id^=toggle-]:checked").attr('checked', false);
		return;
	}
	if (feature.cluster) {
		$.each(feature.cluster, function(index, subfeature) {
			vectors.find("li.listitem[featureid=" + subfeature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr('checked', state);
		});
	} else {
		vectors.find("li.listitem[featureid=" + feature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr('checked', state);
	}
	$('#vectorsearchtext').keyup();
}

firesource.ol.events.selectupdate = function(feature, label) {
    var prefill = feature.attributes[label]
    if (prefill == undefined) {
        prefill = "";
    }
    var attr = window.prompt("Please enter a " + label + " for feature " + feature.fid.split(".")[1], prefill);
    if (!attr) {return false;}
    feature.attributes[label] = attr;
    feature.state = OpenLayers.State.UPDATE;
    s.ol.SaveStrategy.save();
}

firesource.ol.interact.selectupdate = function(layer, label) {
    return new OpenLayers.Control.SelectFeature(layer, {
        multiple: false,
        onSelect: function(f) {
            firesource.ol.events.selectupdate(f, label)
        }
    });
}

firesource.ol.interact.select = function(layer) {
	return new OpenLayers.Control.SelectFeature(layer, {
		clickout: true,
		toggle: false,
		multiple: false,
		hover: false,
		toggleKey: "ctrlKey",
		// ctrl key removes from selection
		multipleKey: "shiftKey",
		// shift key adds to selection
		box: true,
		onSelect: function(f) {
			firesource.ol.events.select(f, true)
		},
		onUnselect: function(f) {
			firesource.ol.events.select(f, false),
			$('#vectorsearchtext').keyup();
		}
	});
}

s.ol.controls.navigate = new OpenLayers.Control.Navigation();

s.ol.navigationHistory = new OpenLayers.Control.NavigationHistory({
	'trackBaseLayerChange': true
});

s.ol.controls.measureLine = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
	persist: true,
	geodesic: true,
	handlerOptions: {
		layerOptions: {
			styleMap: s.ol.styleMaps.sketch
		}
	}
});

s.ol.controls.measureArea = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
	persist: true,
	geodesic: true,
	handlerOptions: {
		layerOptions: {
			styleMap: s.ol.styleMaps.sketch
		}
	}
});

firesource.ol.toggleControl = function(id) {
	$.each(s.ol.controls, function(key, control) {
		if (key != "mouseposition") {
			control.deactivate();
			return true;
		}
	});
	s.ol.controls[id].activate();
	if (id.search("measure") == - 1) {
		$('span#messagetext').stop(true).fadeTo(400, 0);
	}
	if (id == "navigate" && s.ol.SaveStrategy && s.ol.SaveStrategy.active) {
		firesource.ui.updateDataTable(s.ui.dtable, s.ol.activeVector);
	}
}

firesource.ol.toggleLabels = function(layer, labeledStyleMap, unlabeledStyleMap) {
	if (layer.styleMap == labeledStyleMap) {
		layer.styleMap = unlabeledStyleMap;
	} else {
		layer.styleMap = labeledStyleMap;
	}
	layer.redraw(true);
}

firesource.ol.zoomToSelected = function() {
    var feature_ids = $.map($('#vectors input[id^="toggle-"]:checked'), function(i) {return i.id.slice(7)});
    var features = $.grep(s.ol.activeVector.strategies[0].features, function(e) {return $.inArray(e.id, feature_ids) > -1});
	if (features.length > 0) {
		var bounds = false;
		$.each(features, function(index, feature) {
            if (!bounds) {
				bounds = feature.geometry.getBounds().clone();
			} else {
				bounds.extend(feature.geometry.getBounds());
			}
		});
		s.ol.olmap.zoomToExtent(bounds, true);
		s.ol.navigationHistory.previousStack.unshift(s.ol.navigationHistory.getState());
	}
}

firesource.ol.handleMeasurements = function(event) {
	var geometry = event.geometry;
	var units = event.units;
	var order = event.order;
	var measure = event.measure;

	var nautmiles;
	var ha;
	if (order == 1) {
		if (units == "m") {
			nautmiles = measure * 0.0005399568034557236;
		} else if (units == "km") {
			nautmiles = measure * 0.5399568034557235;
		}
		$('span#messagetext').text("Distance: " + measure.toFixed(3) + " " + units + " / " + nautmiles.toFixed(3) + " Nm").stop(true).fadeTo(0, 1);
	}
	else {
		// Convert to hectares
		if (units == "m") {
			ha = measure * 0.0001;
		} else if (units == "km") {
			ha = measure * 100;
		};
		$('span#messagetext').text("Area: " + ha.toFixed(3) + " ha").stop(true).fadeTo(0, 1);
	}
}

//calculate total distance of a line feature
firesource.ol.lineDistance = function(linefeature) {
	var distance = 0;
	var previous = null;

	$.each(linefeature.geometry.getVertices(), function(index, value) {
		if (index == 0) {
			previous = new OpenLayers.LonLat(value.x, value.y);
		} else {
			distance += OpenLayers.Util.distVincenty(previous, new OpenLayers.LonLat(value.x, value.y));
			previous = new OpenLayers.LonLat(value.x, value.y);
		}
	});
	return distance;
}

firesource.ol.zoomToFid = function(fid) {
	var feature = s.ol.activeVector.getFeatureByFid(fid);
	var lonlat = new OpenLayers.LonLat(feature.geometry.getCentroid().x, feature.geometry.getCentroid().y);
	s.ol.olmap.panTo(lonlat);
}

