
define([
    './widgets/Mapillary/mapillary-js.min.js',
    'esri/layers/VectorTileLayer',
    'esri/graphic',
    'esri/SpatialReference',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/InfoTemplate',
    'esri/geometry/Point',
    'esri/geometry/webMercatorUtils',
    'dojo/_base/declare', 
    'dojo/dom',
    'dojo/on',
    'jimu/BaseWidget',
],
function(Mapillary, VectorTileLayer, Graphic, SpatialReference, SimpleMarkerSymbol, InfoTemplate, Point, webMercatorUtils, declare, dom, on, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'mapillary',
    // this property is set by the framework when widget is loaded.
    // name: 'Mapillary',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('Mapillary::postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('Mapillary::startup');
      

      this.mapillary = new Mapillary.Viewer('mly',
                       'cjJ1SUtVOEMtdy11b21JM0tyYTZIQTpiNjQ0MTgzNTIzZGM2Mjhl',
                       null,
                       {
                         cover: false,
                         detection: true
                       });

        // Hide Mappilary viewer
        this.parentEl = this.mapillary._container.element.parentElement;
        this.toggleViewerVisibility(false);

        var layer = new VectorTileLayer(
          'widgets/Mapillary/sequence-tiles.json',
          { id: 'mapillarysequences'}
        );
       
        this.map.addLayer(layer);

        var that = this;

        //TODO: if default...
        console.log('defaultCoverage = ',this.config.defaultCoverage);
        
        dom.byId('mapillarysequences').checked = this.config.defaultCoverage;
        layer.setVisibility(this.config.defaultCoverage);
        
        // Bind event to map click
        this.map.on('click',function (event) {
          var mp = webMercatorUtils.webMercatorToGeographic(event.mapPoint)
          that.mapillary.moveCloseTo(mp.y, mp.x)
        });

        this.mapillary.on('nodechanged', this.onNodeChanged.bind(this));

        
        on(dom.byId('mapillarysequences'), 'change', function (evt) {
          var mapillarysequences = dom.byId('mapillarysequences');

          if(mapillarysequences.checked){
            layer.setVisibility(true);
          }else{
            layer.setVisibility(false);
          }
       });

    },

    // onOpen: function(){
    //   console.log('Mapillary::onOpen');
    // },

    // onClose: function(){
    //   console.log('Mapillary::onClose');
    // },

    // onMinimize: function(){
    //   console.log('Mapillary::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('Mapillary::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('Mapillary::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('Mapillary::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('Mapillary::onPositionChange');
    // },

    // resize: function(){
    //   console.log('Mapillary::resize');
    // }

    //methods to communication between widgets:
    toggleViewerVisibility: function (val) {
      var klaz = 'hide-viewer-content'

      if (val) {
        this.parentEl.classList.remove(klaz)
      } else {
        this.parentEl.classList.add(klaz)
      }
    },

    onNodeChanged: function (node) {
       var lon = node.latLon.lon;
       var lat = node.latLon.lat;
       var diff = 0.001;

       this.map.graphics.clear();
       this.toggleViewerVisibility(true);

       var pt = new Point(lon, lat, new SpatialReference({ 'wkid': 4326 }));
       
       this.map.graphics.add(new Graphic(
         webMercatorUtils.geographicToWebMercator(pt),
         new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 10),
         { 'title': lon + ' ' + lat, 'content': 'A Mapillary Node' },
         new InfoTemplate('${title}', '${content}')
       ));
     },

  });

});
