goog.require('soy');
goog.provide('fssoy');
// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace fssoy.
 */

if (typeof fssoy == 'undefined') { var fssoy = {}; }


fssoy.layerdetaildiv = function(opt_data, opt_ignored) {
  return '<div>' + ((opt_data.item.details.updated) ? '<b>Updated:</b> ' + opt_data.item.details.updated : '') + ((opt_data.item.details.source) ? '<br><b>Source:</b> ' + opt_data.item.details.source : '') + ((opt_data.item.details.custodian) ? '<br><b>Custodian:</b> ' + opt_data.item.details.custodian : '') + ((opt_data.item.details.positionalaccuracy) ? '<br><b>Positional Accuracy:</b> ' + opt_data.item.details.positionalaccuracy : '') + ((opt_data.item.details.scaledependancy) ? '<br><b>Scale Dependancy:</b> ' + opt_data.item.details.scaledependancy : '') + ((opt_data.item.details.labels) ? '<br><b>Labels:</b> ' + opt_data.item.details.labels : '') + ((opt_data.item.details.labelscaledependancy) ? '<br><b>Label Scale Dependancy:</b> ' + opt_data.item.details.labelscaledependancy : '') + ((opt_data.item.details.description) ? '<br><b>Description:</b> ' + opt_data.item.details.description : '') + ((opt_data.item.details.metadata) ? '<br><b>Metadata:</b> ' + opt_data.item.details.metadata : '') + '</div>';
};
if (goog.DEBUG) {
  fssoy.layerdetaildiv.soyTemplateName = 'fssoy.layerdetaildiv';
}


fssoy.resourcedetaildiv = function(opt_data, opt_ignored) {
  return '<div class="float-left" style="padding-top: 5px; width: 77%;"><b>' + soy.$$escapeHtml(opt_data.item.callsign) + '</b> - ' + soy.$$escapeHtml(opt_data.item.name) + '<br><b>Device ID:</b> ' + soy.$$escapeHtml(opt_data.item.deviceid) + '<br><b>Last Logged:</b> ' + soy.$$escapeHtml(opt_data.item.logged_time_str) + '<br><b>Heading: </b>' + soy.$$escapeHtml(opt_data.item.heading) + '<br></div><div class="float-right" style="width: 65px;"><p align="center" style="font-size:10px; line-height:10px;"><img width=50% src="//static.dpaw.wa.gov.au/static/firesource/static/build/symbols/' + soy.$$escapeHtml(opt_data.item.symbol) + '_64.png"><br>' + soy.$$escapeHtml(opt_data.item.symboltext) + '</p></div>';
};
if (goog.DEBUG) {
  fssoy.resourcedetaildiv.soyTemplateName = 'fssoy.resourcedetaildiv';
}


fssoy.viewItem = function(opt_data, opt_ignored) {
  return '<li class="listitem view-immutable" itemid="' + soy.$$escapeHtml(opt_data.item.map_id) + '"><div class="itemtitle"><label class="itemname" >' + soy.$$escapeHtml(opt_data.item.name) + ' (' + soy.$$escapeHtml(opt_data.item.type) + ')</label></div><div class="buttonset-view"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to load this view" class="ui-state-default ui-corner-all ui-button-text-only">Load</a></div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.item.tags) + '</p><div class="details-view" style="font-size:10px; display:none"></div><div class="edit-view" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.viewItem.soyTemplateName = 'fssoy.viewItem';
}


fssoy.layerItem = function(opt_data, opt_ignored) {
  return '<li class="listitem" itemid="' + soy.$$escapeHtml(opt_data.item.id) + '" itemtype="' + soy.$$escapeHtml(opt_data.item.type) + '"><div class="itemtitle">' + ((opt_data.item.type == 'imagery') ? '<input title="Click to select this layer as base layer" type="radio" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" name="imagerylayers" class="float-left" />' : '<input title="Click to turn this layer on/off" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" class="float-left" />') + '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '">' + soy.$$escapeHtml(opt_data.item.name) + '</label></div><div class="buttonset-layer showonselect hideonselect" style="display:none;"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Layer Details" class="ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + ((opt_data.item.refreshable) ? '<a title="Click to refresh the Layer" class="ui-state-default ui-corner-all ui-button-text-only">Refresh</a>' : '') + ((opt_data.item.type == 'point' || opt_data.item.type == 'line' || opt_data.item.type == 'polygon') ? '<button title="Inspect features" role="button" class="ui-button ui-widget ui-corner-all ui-state-default ui-button-text-only inspect-features"><span class="ui-button-icon-primary ui-icon gisicon-inspect gis-icon"></span></button>' : '') + '<span class="float-right latest_data">' + soy.$$escapeHtml(opt_data.item.latest_data) + '</span><span style="position: relative; font-size: 7px; font-weight: bold; float: left; width: 95%; top: 2px; text-align: center;"><span style="float: left;">&nbsp;0</span>Opacity %<span style="float: right;">100&nbsp;</span></span></div><div id="slider-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" class="showonselect hideonselect" style="display:none;"></div><p class="tags hideonselect" style="display:none"><b>Search Tags: </b>id:' + soy.$$escapeHtml(opt_data.item.id) + ', type:' + soy.$$escapeHtml(opt_data.item.type) + ', ' + soy.$$escapeHtml(opt_data.item.tags) + '</p><a href="' + soy.$$escapeHtml(opt_data.item.legend) + '" target="_blank"><img class="legend-layer hideonselect contain float-right" style="display:none;" src="' + soy.$$escapeHtml(opt_data.item.legend) + '"/></a><div class="details-layer hideonselect" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.layerItem.soyTemplateName = 'fssoy.layerItem';
}


fssoy.vectorItem = function(opt_data, opt_ignored) {
  return '<li class="listitem" featureid="' + soy.$$escapeHtml(opt_data.id) + '"><div class="itemtitle"><input title="Click to select/unselect this vector" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.id) + '" class="float-left" />' + ((opt_data.attributes.name) ? (opt_data.attributes.callsign) ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.callsign) + ' - ' + soy.$$escapeHtml(opt_data.attributes.name) + '</label>' : '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.name) + '</label>' : (opt_data.attributes.deviceid) ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.deviceid) + '</label>' : '') + '</div><div class="buttonset-vector"><a title="Click to view searchable tags" class="tags ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Device Details" class="details ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + ((opt_data.attributes.age <= 1) ? '<span style="color:#008800"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : (opt_data.attributes.age <= 3) ? '<span style="color:#CCCC00"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : (opt_data.attributes.age > 3) ? '<span style="color:#CC0000"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : '<b> Updated: </b><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.age) + ' - ' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>') + '</div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.searchtags) + '</p><div class="details-vector" style="font-size:10px; display:none"></div><div class="edit-vector" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.vectorItem.soyTemplateName = 'fssoy.vectorItem';
}


fssoy.listTags = function(opt_data, opt_ignored) {
  var output = '';
  var itemList169 = opt_data.items;
  var itemListLen169 = itemList169.length;
  for (var itemIndex169 = 0; itemIndex169 < itemListLen169; itemIndex169++) {
    var itemData169 = itemList169[itemIndex169];
    output += '<li class="listitem"><a searchid="' + soy.$$escapeHtml(itemData169.id) + '">' + soy.$$escapeHtml(itemData169.name) + '</a></li>';
  }
  return output;
};
if (goog.DEBUG) {
  fssoy.listTags.soyTemplateName = 'fssoy.listTags';
}


fssoy.helloWorld = function(opt_data, opt_ignored) {
  return 'Hello world!';
};
if (goog.DEBUG) {
  fssoy.helloWorld.soyTemplateName = 'fssoy.helloWorld';
}


fssoy.ollayerwms = function(opt_data, opt_ignored) {
  return 'new OpenLayers.Layer.WMS("' + opt_data.id + '", "' + opt_data.url + '", {layers:"' + opt_data.layers + '", tiled:true, transparent:' + opt_data.transparent + '}, {buffer:0} );';
};
if (goog.DEBUG) {
  fssoy.ollayerwms.soyTemplateName = 'fssoy.ollayerwms';
}


fssoy.ollayertms = function(opt_data, opt_ignored) {
  return 'new OpenLayers.Layer.TMS("' + opt_data.id + '", "' + opt_data.url + '", {layername:"' + opt_data.layers + '@gda94@' + ((opt_data.transparent) ? 'png' : 'jpeg') + '", type:"' + ((opt_data.transparent) ? 'png' : 'jpeg') + '"} );';
};
if (goog.DEBUG) {
  fssoy.ollayertms.soyTemplateName = 'fssoy.ollayertms';
}
