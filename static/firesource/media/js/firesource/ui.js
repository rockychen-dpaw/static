goog.provide('firesource.ui');
goog.require('firesource.session');
firesource.ui.actions = {
}; //button actions etc
s.ui.global = {
}
firesource.ui.geocode = function (query) {
  var lon = Math.round(s.ol.olmap.getCenter().lon * 10) / 10;
  var lat = Math.round(s.ol.olmap.getCenter().lat * 10) / 10;
  var mapcenter = new OpenLayers.Geometry.Point(lat, lon);
  var lonlat = lon + ',' + lat;
  var mapbox_apikey = "pk.eyJ1IjoiZHBhd2FzaSIsImEiOiJtVjY5WmlFIn0.whc76euXLk2PkyxOkZ5xlQ";
  s.last_geocode = query;
  $.ajax({
    url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '+wa+au.json?' + $.param({proximity: lonlat, access_token: mapbox_apikey}),
    xhrFields: {
      withCredentials: false
    },
    success: function (data) {
      s.geocode_results = data
      var feature = data.features[0]
      var closest = mapcenter.distanceTo(new OpenLayers.Geometry.Point(feature.center[1], feature.center[0]))
      $.each(data.features, function (index, f) {
        var fpoint = new OpenLayers.Geometry.Point(f.center[1], f.center[0])
        if ((closest - mapcenter.distanceTo(fpoint)) > 20) {
          feature = f;
          closest = mapcenter.distanceTo(fpoint);
        }
      })
      if (closest < 20 && feature.place_name != "Western Australia, Australia") {
          firesource.ui.setMessageText("Panning to " + feature.place_name)
          s.ol.olmap.panTo(feature.center)
      } else {
          firesource.ui.setMessageText("No results found in 2000km radius from centre of map.")
      }
    }
  })
}
firesource.ui.geocodeSetup = function() {
    //setup before functions
    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example
    var ginput = $("#geocodequery");

    //on keyup, start the countdown
    ginput.keyup(function(){
        clearTimeout(typingTimer);
        if (ginput.val() != "" && ginput.val() != s.last_geocode) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });

    //user is "finished typing," do something
    function doneTyping () {
      firesource.ui.geocode(ginput.val())
    }
}
firesource.ui.geocodeSetup();

firesource.ui.setMessageText = function (text) {
  $('span#messagetext').text(text).stop(true).fadeTo(0, 1, function () {
    $(this).delay(4000).fadeOut(1000);
  });
  return true;
}
$('span#messagetext').ajaxError(function (e, xhr, settings, exception) {
  firesource.ui.setMessageText('Error loading ' + settings.url + ': ' + exception);
});
firesource.ui.actions.layerChange = function (e) {
  var toggle = $(e.target)
  var listitem = toggle.parents('li.listitem')
  var layerid = listitem.attr('itemid')
  var type = listitem.attr('itemtype')
  var lyr = s.ol.layers[type][layerid];
  var vectorselector = $('select#vectors-select');
  var current = vectorselector.val();
  if (type == 'vector') { // rescan vector layers for dropdown
    vectorselector.empty();
    var newval = false;
    $('ul#layers').find('li[itemtype=vector]').find('[id^=toggle]:checked').parents('li.listitem').each(function () {
      layerid = $(this).attr('itemid');
      if (current == layerid) {
        newval = layerid;
      }
      vectorselector.append('<option value="' + $(this).attr('itemid') + '">' + $(this).find('label.itemname').text() + '</option>');
    });
    if (newval) {
      s.ui.states.vectorsBuilt = true;
      vectorselector.val(newval);
      s.ui.states.selectedVector = newval;
    } else {
      s.ui.states.vectorsBuilt = false;
    }
    vectorselector.change();
  }
  if (type == 'imagery') { //update overview map
    var prevstack = s.ol.navigationHistory.previousStack;
    var nextstack = s.ol.navigationHistory.nextStack;
    $.each(s.ol.olmap.getControlsByClass('OpenLayers.Control.OverviewMap'), function (index, ovmap) {
      s.ol.olmap.removeControl(ovmap);
      ovmap.destroy();
    });
    s.ol.olmap.setBaseLayer(lyr);
    s.ol.olmap.addControl(firesource.ol.maps.overMap('#overviewmapdiv'));
    $('div.olControlOverviewMapElement').height('100%').css('padding','0px');
    $('div.olControlOverviewMapElement').children('div.olMap').width('auto').height('100%');
    firesource.ol.jiggleMap(s.ol.olmap);
    s.ol.navigationHistory.previousStack = prevstack;
    s.ol.navigationHistory.nextStack = nextstack;
    $('ul#layers').find('li[itemtype=imagery]').find('.hideonselect').hide()
  } else if (toggle[0].checked) {
    lyr.setVisibility(true);
    if (lyr.query_vector) { //refresh vector layer on select
      if (lyr.name != current || !s.ui.states.vectorsBuilt) {
        lyr.query_vector();
      }
    }
  } else {
    lyr.setVisibility(false);
  }
  if (toggle[0].checked) {
    listitem.find('div.showonselect').show();
  } else {
    listitem.find('.hideonselect').hide();
  }
}
firesource.ui.actions.layerSlide = function (e, ui) {
  var listitem = $(e.target).parents('li.listitem')
  var layerid = listitem.attr('itemid')
  var type = listitem.attr('itemtype')
  var lyr = s.ol.layers[type][layerid];
  lyr.setOpacity(ui.value / 100);
}
firesource.ui.actions.layerMouseUp = function (e) {
  var item = $(e.target)
  var listitem = item.parents('li.listitem')
  var layerid = listitem.attr('itemid')
  if (item.text() == 'Tags') {
    var tagsp = listitem.find('p.tags');
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide()
    } else {
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show()
    }
  } else if (item.text() == 'Detail') {
    var detailsdiv = listitem.find('div.details-layer');
    var legend = listitem.find('.legend-layer');
    var layeritem = jLinq.from(s.results.layers).equals('id', layerid).select();
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
      legend.hide();
    } else {
      item.removeClass('ui-state-default').addClass('ui-state-active');
      detailsdiv.empty().append(fssoy.layerdetaildiv({
        'item': layeritem[0]
      })).show();
      legend.show();
    }
  } else if (item.text() == 'Refresh') {
    var type = listitem.attr('itemtype')
    var layer = s.ol.layers[type][layerid];
    if (layer.query_vector) {
      layer.query_vector();
    } else {
      layer.redraw(true);
    }
  } else if ($(item).hasClass('inspect-features')) {
    if (item.hasClass('ui-state-active')) {
      s.inspect = false;
      item.removeClass('ui-state-active').addClass('ui-state-default');
    } else {
      $('.inspect-features.ui-state-active').removeClass('ui-state-active').addClass('ui-state-default');
      item.removeClass('ui-state-default').addClass('ui-state-active');
      var type = listitem.attr('itemtype');
      var layer = s.ol.layers[type][layerid];
      s.inspect = function (xy) {
        $.get(layer.url + '?' + $.param({
          LAYERS: layer.params.LAYERS,
          SRS: layer.params.SRS,
          SERVICE: layer.params.SERVICE,
          VERSION: layer.params.VERSION,
          REQUEST: 'GetFeatureInfo',
          BBOX: s.ol.olmap.getExtent().toBBOX(),
          INFO_FORMAT: 'text/plain',
          X: xy.x,
          Y: xy.y,
          HEIGHT: $(s.ol.olmap.div).height(),
          WIDTH: $(s.ol.olmap.div).width()
        }), function (data) {
          if (data.slice(0, 2) == 'no') {
            alert(data)
          } else {
            alert(s.ol.olmap.getLonLatFromPixel(xy) + '\n' + data.split('\n').slice(1).join('\n'));
          }
        });
      }
    }
  }
}
// This gets called by each layer on load

firesource.ui.layerSliderOpacity = function (element) {
  var listitem = $(element).parents('li.listitem');
  var layerid = listitem.attr('itemid');
  var type = listitem.attr('itemtype');
  var layer = s.ol.layers[type][layerid];
  if (layer.shown) {
    listitem.find('input[id^=toggle-]').prop('checked', true).change();
  }
  if (layer.opacity != undefined) {
    return layer.opacity;
  } else {
    return 1;
  }
}
$('ul#layers').live('change', firesource.ui.actions.layerChange).live('slide', firesource.ui.actions.layerSlide).live('mouseup', firesource.ui.actions.layerMouseUp);
firesource.ui.actions.contentSearch = function (e) {
  // expects a link with an attribute of searchid
  var tags = $(e.target).attr('searchid')
  $('div#contents input[id*=searchtext]:visible').val(tags).keyup();
}
$('div.listtags ul.list a').live('click', firesource.ui.actions.contentSearch);
//add map hover handler
firesource.ui.mapMouseOver = function (e) {
  if (e.target._featureId) {
    var layerid = $(e.target).parents('div.olLayerDiv').attr('id');
    var layer = s.ol.olmap.getLayersBy('id', layerid) [0];
    var feature = layer.getFeatureById(e.target._featureId);
    firesource.ol.hoverdetails(feature);
  } else {
    firesource.ol.hoverdetails(null);
  }
}
$('div#map').live('mouseover', firesource.ui.mapMouseOver);
firesource.ui.restoreLayerState = function (layerid) {
  //get layer states
  //add handlers
  var layers = $('ul#layers');
  var activelayerstoggle = layers.find('input[id^=toggle-]:checked');
  if (layerid) {
    layersliders = layers.find('li.listitem[itemid^=' + layerid + ']').find('div[id^="slider-"]'); //slider for layer in parameter
  } else {
    layersliders = layers.children('li.listitem').find('div[id^="slider-"]').reverse(); //starts with imagery
  }
  layersliders.each(function () {
    var slider = $(this)
    slider.slider({
      range: 'min',
      value: Math.round(firesource.ui.layerSliderOpacity(slider) * 100)
    });
  });
  s.ol.olmap.resetLayersZIndex();
  if (!layerid) {
    $.each(activelayerstoggle, function (index, layertoggle) {
      layertoggle.checked = true;
    });
    activelayerstoggle.change();
    layers.sortable({
      placeholder: 'ui-state-highlight',
      update: function (e, ui) {
        var listitem = ui.item;
        var newindex = listitem.siblings().length - listitem.index();
        var layerid = listitem.attr('itemid')
        var type = listitem.attr('itemtype')
        var layer = s.ol.layers[type][layerid];
        s.ol.olmap.setLayerIndex(layer, newindex);
        s.ol.olmap.resetLayersZIndex();
      }
    });
  }
}
firesource.ui.actions.vectorChange = function (e) {
  var toggle = $(e.target)
  if (!toggle.is('input[id^=toggle-]')) {
    return;
  }
  var listitem = toggle.parents('li.listitem')
  var featureid = listitem.attr('featureid')
  var feature = s.ol.activeVector.getFeatureById('OpenLayers.Feature.' + featureid);
  if (feature) {
    if (toggle[0].checked) {
      s.ol.controls.select.select(feature);
    } else {
      s.ol.controls.select.unselect(feature);
    }
  }
}
firesource.ui.actions.vectorMouseUp = function (e) {
  var item = $(e.target);
  var listitem = item.parents('li.listitem');
  var featureid = listitem.attr('featureid');
  var editdiv = listitem.find('div.edit-vector');
  var othereditdivs = listitem.siblings().find('div.edit-vector');
  var detailsdiv = listitem.find('div.details-vector');
  var tagsp = listitem.find('p.tags');
  if (item.text() == 'Tags') {
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show();
    }
  } else if (item.text() == 'Detail') {
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      var feature = firesource.ol.getFeaturesBy('id', s.ol.activeVector, featureid) [0];
      feature.attributes.symboltext = feature.attributes.symbol.split('/') [1].replace(/_/g, ' ')
      detailsdiv.empty().append(fssoy.resourcedetaildiv({
        'item': feature.attributes
      })).show();
    }
  }
}
$('ul#vectors').live('change', firesource.ui.actions.vectorChange).live('mouseup', firesource.ui.actions.vectorMouseUp);
firesource.ui.returnFeatureData = function (feature) {
  var searchtags = '';
  $.each(feature.attributes, function (key, value) {
    if (value && key[0] != '_') {
      value = value + '';
      if (key == 'tags') {
        searchtags += value;
      } else {
        searchtags += key.replace(/\W+/g, '_') + ':' + value.replace(/\W+/g, '_') + ', ';
      };
    }
  });
  searchtags = searchtags.toLowerCase().slice(0, - 2);
  feature.attributes.logged_time_str = dateFormat(timezoneDate(feature.attributes.logged_time), 'dd/mm/yyyy HH:MM');
  var data = {
    'attributes': feature.attributes,
    'id': feature.id.split('.').pop(),
    'searchtags': searchtags,
    'is_staff': django_permissions.is_staff
  }
  return data;
}
firesource.ui.updateDataTable = function (table, layer) {
  if (!layer.features || layer.features.length == 0) {
    return false;
  } else {
    firesource.ui.setMessageText('Updating attributes...');
  }
  table.fnClearTable();
  var columns = [
  ]
  table.find('th').each(function () {
    columns.push($(this).text())
  })
  var rows = jLinq.from(layer.features).select(function (f) {
    var row = [
    ]
    if (f.fid == null) {
      f.fid = layer.name + '.-1';
    }
    $.each(columns, function (index, value) {
      if (value == 'fid') {
        row.push('<a onclick="firesource.ol.zoomToFid(\'' + f.fid + '\'); return false;">' + f.fid.split('.') [1] + '</a>'); // just get number
      } else {
        row.push(f.attributes[value]);
      }
    });
    return row;
  });
  s.ui.dtable.fnAddData(rows);
  return true;
}
firesource.ui.actions.viewsMouseUp = function (e) {
  var item = $(e.target);
  var listitem = item.parents('li.listitem');
  var viewid = listitem.attr('itemid');
  var editdiv = listitem.find('div.edit-view');
  var othereditdivs = listitem.siblings().find('div.edit-view');
  var detailsdiv = listitem.find('div.details-view');
  var tagsp = listitem.find('p.tags');
  var viewobject = s.ol.userviews[viewid];
  if (item.text() == 'Tags') {
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show();
    }
  } else if (item.text() == 'Detail') {
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      detailsdiv.empty().append('details div').show();
    }
  } else if (item.text() == 'Load') { //load map to screen
    firesource.ol.loadView(viewobject);
  } else if (item.text() == 'Update') {
    firesource.ui.createView(viewobject.type, viewobject.name);
  }
}
$('ul#views').live('mouseup', firesource.ui.actions.viewsMouseUp);
firesource.ui.renderVectors = function (layer) {
  var vectors = $('ul#vectors');
  vectors.empty();
  if (layer.features.length > 0) {
    $.each(layer.features, function (index, feature) {
      if (feature.cluster) {
        $.each(feature.cluster, function (index, f) {
          if (f.cluster == undefined) {
            vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(f)));
          }
        });
      } else if (feature.cluster == undefined) {
        vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(feature)));
      }
    });
    if (!django_permissions.is_staff) {
      vectors.find('a[text=Edit]').remove();
    }
  }
}
jQuery.expr[':'].regex = function (elem, index, match) {
  regexFlags = 'ig',
  regex = new RegExp(match[3], regexFlags);
  return regex.test(jQuery(elem).text());
}
jQuery.expr[':'].toggled = function (elem, index, match) {
  return jQuery(elem).find('input[id^=toggle]:checked').length == 1;
}
// search is a space separated string of search terms
// list is a $(element) containing listitems to filter by id
// matches to the search

firesource.ui.search = function (search, list) {
  if (search == '') {
    //show everything on blank search
    list.find('li.listitem').show();
    return true;
  } else {
    // hide everything
    list.find('li.listitem').hide()
    if (search.search('regex:') == 0) {
      list.find('li.listitem:regex("' + search.slice(6) + '")').show();
      return true;
    } else {
      //basic and/or
      var terms = search.split(' ');
      var andstring = '';
      var orstring = '';
      var extras = '';
      $.each(terms, function (index, term) {
        if (term == 'checked') {
          extras += ':toggled';
        } else {
          orstring += term + '|';
          andstring += '(?=.*' + term + ')';
        }
      });
      if (orstring != '') {
        orstring = ':regex("' + orstring.slice(0, - 1) + '")';
      };
      if (andstring != '') {
        andstring = ':regex("' + andstring + '")';
      };
      var results = list.find('li.listitem' + andstring + extras);
      if (results.length > 0) {
        results.show();
      } else {
        list.find('li.listitem' + orstring + extras).show();
      }
      return true;
    }
  }
}
firesource.ui.setHistoryFields = function (milliseconds) {
  now = new Date();
  $('input#vector-history-to-date').val(now.format('dd/mm/yyyy'));
  $('input#vector-history-to-time').val(now.format('HH:MM'));
  from = new Date(now.getTime() - milliseconds);
  $('input#vector-history-from-date').val(from.format('dd/mm/yyyy'));
  $('input#vector-history-from-time').val(from.format('HH:MM'));
}
firesource.ui.renderMapControls = function () {
  //zoomslider for map
  s.ui.zoomslider = $('div.slider-ui-zoom');
  s.ui.zoomslider.children('.slider').slider({
    range: 'min',
    min: 0,
    max: 17,
    orientation: 'vertical',
    stop: function (event, ui) {
      s.ol.olmap.zoomTo(ui.value);
    }
  });
  s.ui.zoomslider.children('.gisicon-zoomin').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomin'
    }
  }).click(function () {
    s.ol.olmap.zoomIn()
  });
  s.ui.zoomslider.children('.gisicon-zoomout').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomout'
    }
  }).click(function () {
    s.ol.olmap.zoomOut()
  });
  //make awesome layouts
  s.ui.bodyLayout = $('body').layout({
    fxName: 'none',
    north__size: 26,
    north__resizable: false,
    west__size: 420,
    west__minSize: 360,
    west__maxSize: ($(window).width() * 0.5),
    west__onresize: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    west__onopen: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    west__onclose: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__initHidden: true,
    south__size: ($(window).height() * 0.3),
    south__maxSize: ($(window).height() * 0.5),
    south__minSize: ($(window).height() * 0.1),
    south__onresize: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__onopen: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__onclose: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()'
  });
  s.ui.contentsLayout = $('div#contents').layout({
    fxName: 'none',
    north__size: 30,
    north__closable: false,
    north__resizable: false,
    center__onresize: 's.ui.contentdivLayout.resizeAll',
    center__onopen: 's.ui.contentdivLayout.resizeAll',
    south__size: ($(window).height() * 0.3),
    south__maxSize: ($(window).height() * 0.5),
    south__minSize: ($(window).height() * 0.1)
  });
  s.ui.contentdivLayout = $('div#contents').children('.ui-layout-center').layout({
    fxName: 'none',
    north__size: 28,
    north__closable: false,
    north__resizable: false,
    west__size: 120,
    west__resizable: false,
    south__initHidden: true,
    south__resizable: false,
    south__size: 150
  });
  //left toolbar buttons
  $('input#controlpan').button({
    text: false,
    icons: {
      primary: 'gisicon-pan'
    }
  }).click(function () {
    firesource.ol.toggleControl('navigate')
    s.ol.olmap.resetLayersZIndex();
  });
  $('input#controlselect').button({
    text: false,
    icons: {
      primary: 'gisicon-select'
    }
  }).click(function () {
    firesource.ol.toggleControl('select')
    s.ol.olmap.resetLayersZIndex();
  });
  $('button#controldeselect').button({
    text: false,
    icons: {
      primary: 'gisicon-deselect'
    }
  }).click(function () {
    while (s.ol.activeVector.selectedFeatures.length > 0) {
      s.ol.controls.select.unselect(s.ol.activeVector.selectedFeatures[0]);
    };
    $('ul#vectors').find('li.listitem').find('input[id^=toggle-]').attr('checked', false);
  });
  $('input#controlmline').button({
    text: false,
    icons: {
      primary: 'gisicon-mline'
    }
  }).click(function () {
    firesource.ol.toggleControl('measureLine')
  });
  s.ol.controls.measureLine.events.on({
    'measure': firesource.ol.handleMeasurements,
    'measurepartial': firesource.ol.handleMeasurements
  });
  $('input#controlmarea').button({
    text: false,
    icons: {
      primary: 'gisicon-marea'
    }
  }).click(function () {
    firesource.ol.toggleControl('measureArea')
  });
  s.ol.controls.measureArea.events.on({
    'measure': firesource.ol.handleMeasurements,
    'measurepartial': firesource.ol.handleMeasurements
  });
  $('button#controlnewdrawing').button({
    text: false,
    icons: {
      primary: 'gisicon-new'
    }
  }).click(function () {
    var drawingname = window.prompt('Please enter a name for your new drawing');
    if (drawingname == null || drawingname == '') {
      firesource.ui.setMessageText('Can\'t create a drawing with no name!')
    } else {
      firesource.ui.createDrawing(drawingname);
    }
  });
  $('button#controlnewview').button({
    text: false,
    icons: {
      primary: 'gisicon-newview'
    }
  }).click(function () {
    $('div#createviewdialog').dialog('open')
  });
  $('button#controlquickpdf').button({
    text: false,
    icons: {
      primary: 'gisicon-quickpdf'
    }
  }).click(function () {
    var name = window.prompt('Map title?', 'Quick Print');
    url = '/apps/spatial/print.pdf?' + $.param({
      'name': name
    }) + '&' + document.location.hash.slice(1);
    window.open(url);
  });
  $('button#controlquickjpg').button({
    text: false,
    icons: {
      primary: 'gisicon-quickjpg'
    }
  }).click(function () {
    var name = window.prompt('Map title?', 'Quick Print');
    url = '/apps/spatial/print.jpg?' + $.param({
      'name': name
    }) + '&' + document.location.hash.slice(1);
    window.open(url);
  });
  $('#controlzoomselect').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomselect'
    }
  }).click(function () {
    firesource.ol.zoomToSelected()
  });
  $('#controlzoomdefault').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomdefault'
    }
  }).click(function () {
    s.ol.olmap.zoomToExtent(s.ol.bounds)
  });
  $('#controlprevview').button({
    text: false,
    icons: {
      primary: 'gisicon-prevview'
    }
  }).click(function () {
    s.ol.navigationHistory.jump('previous', 1)
  });
  $('#controlnextview').button({
    text: false,
    icons: {
      primary: 'gisicon-nextview'
    }
  }).click(function () {
    s.ol.navigationHistory.jump('next', 1)
  });
  $('input#toggletools').button().toggle(function () {
    s.ui.zoomslider.hide();
    $('div#declogo').hide();
    $('div#openlogo').hide();
    $('div#mouseposition').hide();
    $('span.tools').hide();
    $('input#toggletools') [0].checked = false;
    $('input#toggletools').button('refresh');
  }, function () {
    s.ui.zoomslider.show();
    $('div#declogo').show();
    $('div#openlogo').show();
    $('div#mouseposition').show();
    $('span.tools').show();
    $('input#toggletools') [0].checked = true;
    $('input#toggletools').button('refresh');
  }).attr('checked', true).button('refresh');
  $('label[for=toggletools]').mouseenter(function () {
    if (!$(this).is('.ui-state-active')) {
      $('span.tools').fadeIn();
    }
  });
  $('span#toolset').buttonset();
  $('span#viewset').buttonset();
  $('input#toggletools').attr('checked', true);
  $('input#toggletools').change();
  $('span.tools').fadeIn();
  $('span#editset').buttonset().hide();
  //right toolbar buttons
  $('button#buttonrefresh').button({
    text: false,
    icons: {
      primary: 'ui-icon-refresh'
    }
  }).click(function () {
    $('ul#layers li.listitem input:checked').parents('li.listitem').find('a:contains(Refresh)').mouseup()
  });
  $('#refreshset').buttonset();
  //add icon classes
  $('span[class*=\'gisicon\']').addClass('gis-icon');
  //render about dialog
  $('div#aboutdialog').dialog({
    resizable: false
  }).bind('dialogclose', function (event, ui) {
    $('input#toggleabout').attr('checked', false).button('refresh');
  }).bind('dialogopen', function (event, ui) {
    $('input#toggleabout').attr('checked', true).button('refresh');
  });
  //reset about dialog position
  var aboutlabel = $('label[for=toggleabout]')
  var aboutx = aboutlabel.position() ['left'] + aboutlabel.width();
  var abouty = aboutlabel.position() ['top'] + aboutlabel.height() + 6;
  firesource.ui.anchor({
    'x': aboutx,
    'y': abouty
  }, $('div#aboutdialog'), 'top-right');
  //DateTime widgets for resource history
  $('input#vector-history-from-date').datepicker({
    'dateFormat': 'dd/mm/yy',
    'showAnim': '',
    'maxDate': '+0d'
  });
  $('input#vector-history-to-date').datepicker({
    'dateFormat': 'dd/mm/yy',
    'showAnim': '',
    'maxDate': '+0d'
  });
  $('a#clear-history-button').click(function () {
    s.ol.layers.vector.history.destroyFeatures();
    s.ol.layers.vector.history_lines.destroyFeatures();
    s.ol.layers.vector.history_lines.setVisibility(false);
    s.ol.layers.vector.history.setVisibility(false);
  });
  $('a#go-history-button').click(function () {
    //get selected vectors
    var selectedVectors = new Array();
    $('ul#vectors').find('input[id^=toggle-]:checked').parents('li.listitem').each(function () {
      selectedVectors.push(firesource.ol.getFeaturesBy('id', s.ol.activeVector, $(this).attr('featureid')) [0].attributes.deviceid);
    });
    if (selectedVectors.length < 1) {
      firesource.ui.setMessageText('Please select one or more vectors.');
    }
    //validate both timefields, if false, return out of function

    if (!firesource.ui.checkTimeField($('input#vector-history-from-time')) || !firesource.ui.checkTimeField($('input#vector-history-to-time'))) {
      firesource.ui.setMessageText('Validate time fields');
      return;
    }
    //get timezone offset

    var offset = new Date().getTimezoneOffset() * 60000;
    var datefrom = $('input#vector-history-from-date').val();
    datefrom = datefrom.split('/');
    var timefrom = $('input#vector-history-from-time').val();
    //rearrange day and month - required for javascript Date
    var datefrom = datefrom[1] + '/' + datefrom[0] + '/' + datefrom[2] + ' ' + timefrom + ':00';
    //convert to milliseconds using getTime()
    var unixdatefrom = new Date(datefrom).getTime();
    //apply timezone offset
    unixdatefrom += offset;
    datefrom = new Date(unixdatefrom).format('yyyy-mm-dd HH:MM');
    var dateto = $('input#vector-history-to-date').val();
    dateto = dateto.split('/');
    var timeto = $('input#vector-history-to-time').val();
    //rearrange day and month - required for javascript Date
    var dateto = dateto[1] + '/' + dateto[0] + '/' + dateto[2] + ' ' + timeto + ':00';
    //convert to milliseconds using getTime()
    var unixdateto = new Date(dateto).getTime();
    //apply timezone offset
    unixdateto += offset;
    dateto = new Date(unixdateto).format('yyyy-mm-dd HH:MM');
    //get queried layer index and adjust by one
    s.ol.historyLayerIndex = s.ol.olmap.getLayerIndex(s.ol.activeVector) - 1;
    s.ol.activeVector.query_history(datefrom, dateto, selectedVectors);
  });
  //render maps, layers and vector stuff
  $('label[for=views-tab]').mouseup(function () {
    //hide other divs
    $('div#views-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#views-div-north'));
    pane.children('div.ui-layout-west').append($('div#views-div-west'));
    pane.children('div.ui-layout-center').append($('div#views-div-center'));
    s.ui.contentdivLayout.hide('south');
    $('select#vectors-select').removeClass('ui-state-active').addClass('ui-state-default');
  });
  $('label[for=layers-tab]').mouseup(function () {
    //hide other divs
    $('div#layers-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#layers-div-north'));
    pane.children('div.ui-layout-west').append($('div#layers-div-west'));
    pane.children('div.ui-layout-center').append($('div#layers-div-center'));
    s.ui.contentdivLayout.hide('south');
    s.ui.contentdivLayout.show('west');
    $('select#vectors-select').removeClass('ui-state-active').addClass('ui-state-default');
  });
  $('label[for=vectors-tab]').mouseup(function () {
    //hide other divs
    $('div#vectors-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#vectors-div-north'));
    pane.children('div.ui-layout-west').append($('div#vectors-div-west'));
    pane.children('div.ui-layout-center').append($('div#vectors-div-center'));
    pane.children('div.ui-layout-south').append($('div#vectors-div-south'));
    s.ui.contentdivLayout.show('south');
    s.ui.contentdivLayout.show('west');
    s.ui.contentdivLayout.sizePane('south', 150);
    $('select#vectors-select').removeClass('ui-state-default').addClass('ui-state-active');
  });
  $('div#contentstabs').buttonset();
  $('input#viewsearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#views'));
  });
  $('label[for=layers-tab]').click().mouseup();
  $('input#layersearchtoggle').change(function () {
    var state = this.checked;
    $('ul#layers').find('input[type!=radio][id^=toggle-]:visible').each(function () {
      this.checked = state;
      $(this).change()
    });
  });
  $('input#layersearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#layers'));
  });
  $('input#vectorsearchtoggle').change(function () {
    var state = this.checked;
    $('ul#vectors').find('input[id^=toggle-]:visible').each(function () {
      this.checked = state;
      $(this).change()
    });
  });
  $('input#vectorsearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#vectors'));
  });
  $('select#vectors-select').change(function () {
    if (s.ol.activeVector && s.ol.activeVector.protocol && s.ol.activeVector.protocol.CLASS_NAME == 'OpenLayers.Protocol.WFS.v1_1_0') {
      // bail if edit session active
      return;
    }
    var layerid = $(this).val();
    if (layerid != s.ui.states.selectedVector) {
      s.ui.states.vectorsBuilt = false;
      s.ui.states.selectedVector = layerid;
      s.ol.activeVector = s.ol.layers.vector[layerid];
    }
    if (!s.ui.states.vectorsBuilt && s.ol.activeVector) {
      if ($('ul#vectors').find('input[id^=toggle-]:checked').length > 0) {
        firesource.ui.setMessageText('Refreshing Vectors - selections have been cleared');
      }
      if (s.ol.controls.select) {
        s.ol.controls.select.setLayer(s.ol.activeVector);
      } else {
        s.ol.controls.select = firesource.ol.interact.select(s.ol.activeVector);
        s.ol.olmap.addControl(s.ol.controls.select);
      }
      if (s.ol.activeVector) {
        firesource.ui.renderVectors(s.ol.activeVector);
        s.ui.states.vectorsBuilt = true;
      }
    }
    s.ol.olmap.resetLayersZIndex();
    if ($('ul#vectors').is(':visible')) {
      $('label[for=vectors-tab]').mouseup();
    }
    $('input#vectorsearchtext').keyup();
  });
  // complex click events
  $('input#controlcreatemap').click(firesource.ui.createMap);
  $('input#controlcreatetheme').click(firesource.ui.createTheme);
  $('form#layerlegendform a').click(firesource.ui.createLayerLegend);
  $('a#lasthour-history').click(function () {
    firesource.ui.setHistoryFields(60 * 60 * 1000);
  }).click(); //1 hour in milliseconds
  $('a#last3hours-history').click(function () {
    firesource.ui.setHistoryFields(3 * 60 * 60 * 1000);
  }); //3 hours in milliseconds
  $('a#lastday-history').click(function () {
    firesource.ui.setHistoryFields(24 * 60 * 60 * 1000);
  }); //1 day in milliseconds
  $('a#lastweek-history').click(function () {
    firesource.ui.setHistoryFields(7 * 24 * 60 * 60 * 1000);
  }); //1 week in milliseconds
  $('a#lastmonth-history').click(function () {
    firesource.ui.setHistoryFields(31 * 24 * 60 * 60 * 1000);
  }); //31 days in milliseconds
  // simple click events
  $('a#allvectors').click(function () {
    $('input#vectorsearchtext').val('').keyup()
  });
  $('a#selectedvectors').click(function () {
    $('input#vectorsearchtext').val('checked').keyup()
  });
  //wire buttons
  $('div#createviewdialog').dialog({
    'modal': true,
    'draggable': false,
    'resizable': false,
    'width': 'auto',
    'height': 'auto'
  }).dialog('close');
  $('div#aboutdialog').dialog('close');
  $('input#toggleabout').button().toggle(function () {
    $('div#aboutdialog').dialog('open');
    $(e.target).attr('checked', true).button('refresh');
  }, function () {
    $('div#aboutdialog').dialog('close');
    $(e.target).attr('checked', false).button('refresh');
  });
  $('div#settingsdialog').dialog('close');
  $('input#togglesettings').button().toggle(function (e) {
    $('div#settingsdialog').dialog('open');
    $(e.target).attr('checked', true).button('refresh');
  }, function (e) {
    $('div#settingsdialog').dialog('close');
    $(e.target).attr('checked', false).button('refresh');
  });
  $('input#togglecontents').button().toggle(function (e) {
    s.ui.bodyLayout.close('west');
    $(e.target).attr('checked', false).button('refresh');
  }, function (e) {
    s.ui.bodyLayout.open('west');
    $(e.target).attr('checked', true).button('refresh');
  }).attr('checked', true).button('refresh');
}
//dialog anchor function
//position - dict of x,y e.g. [200,300]
//dialog_box - jquery dialog-content
//corner - corner of the dialog you wish to anchor to the given position

firesource.ui.anchor = function (position, dialog_box, corner) {
  x = position['x']
  y = position['y']
  if (corner == 'top-left') {
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'top-right') {
    x -= dialog_box.width();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'bottom-left') {
    y -= dialog_box.height();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'bottom-right') {
    x -= dialog_box.width();
    y -= dialog_box.height();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  }
}
firesource.ui.checkTimeField = function (field) {
  if (field.val) { //case jquery for input object
    value = field.val()
  } else { //case html input object
    value = field.value
  }
  // regular expression to match required time format

  re = /^(\d{1,2}):(\d{2})$/;
  if (value != '') {
    if (regs = value.match(re)) {
      // 24-hour time format
      if (regs[1] > 23) {
        return false;
      }
      if (regs[2] > 59) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

