goog.provide('firesource.ol.loadingpanel');

OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized
    */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible
    */
    visible: true,

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says 'loading'.
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
         OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Function: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
    */
    setVisible: function(visible) {
        this.visible = visible;
    },

    /**
     * Function: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
    */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
    */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
    */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
    */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map
     *
     * Parameters:
     * evt - {Event}
    */
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register('loadstart', this, this.increaseCounter);
            evt.layer.events.register('loadend', this, this.decreaseCounter);
            evt.layer.events.register('loadcancel', this, this.clear);
            evt.layer.events.register('visibilitychanged', this, this.clear);
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register('preaddlayer', this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register('loadstart', this, this.increaseCounter);
            layer.events.register('loadend', this, this.decreaseCounter);
            layer.events.register('loadcancel', this, this.clear);
            layer.events.register('visibilitychanged', this, this.clear);
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control
    */
    clear: function(evt) {
        if (evt.object.visibility == false) {
            var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
            lyrli.removeClass("loaded-tiles loading-tiles");
        }
    },

    increaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        lyrli.removeClass("loaded-tiles broken-tiles").addClass("loading-tiles");
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished
    */
    decreaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        if (evt.object.grid && $(evt.object.grid[0][0].imgDiv).hasClass("olImageLoadError")) {
            if (evt.object.isBaseLayer) {
                window.alert('Base Imagery "' + lyrli.find("label").text() + '" ('+evt.object.grid[0][0].imgDiv.src.split("?")[0]+') doesn\'t seem to be loading properly, try switching to another.');
            } else if (window.confirm('Layer "' + lyrli.find("label").text() + '" ('+evt.object.grid[0][0].imgDiv.src.split("?")[0]+') doesn\'t seem to be loading properly, would you like to disable it?')) {
                lyrli.find("input").attr("checked", false).change();
            }
            lyrli.removeClass("loading-tiles").addClass("broken-tiles");
        } else {
            if (evt.object.grid && lyrli.find("a:contains('Refresh')").length == 1) {
                lyrli.find("span.latest_data").text(dateFormat(new Date(), "dd/mm/yyyy HH:MM"));
            }
            lyrli.removeClass("loading-tiles").addClass("loaded-tiles");
        }
    },

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        $('#map').loading(false);
        this.maximized = false;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        $('#map').loading(true, {pulse:'ellipsis', align:'center'});
        this.maximized = true;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister('preaddlayer', this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister('loadstart', this,
                        this.increaseCounter);
                    layer.events.unregister('loadend', this,
                        this.decreaseCounter);
                    layer.events.unregister('clear', this,
                        this.clear);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.LoadingPanel"

});
