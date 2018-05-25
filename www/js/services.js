angular.module('sctrails.services', [])

/**
 * A simple example service that returns some data.
 */
 .service('trailLocator', function(){
    this.trailLocation = null;
 })

.service('TrailCache', function(){
    this.trailData = null;
    this.markers = [];
})

.factory('GeoJSONLayers', function() {
        var handler = function()
        {
            this.clear();
        };

        handler.prototype.clear = function()
        {
            this.json = {
                type : "FeatureCollection",
                features : []
            };
            this.layerStyles = {};
        };

        handler.prototype.addLayer = function(layerID, geoJSON, rating, open, styleCallback)
        {
            this.layerStyles[layerID] = styleCallback;

            // tag features with their assigned layer
            geoJSON.features.forEach(function(feature, i) {
                feature.properties.__LAYERID__ = layerID;
                feature.properties.rating = rating;
                feature.properties.open = open;
            });

            // merge into current objects
            Array.prototype.push.apply(this.json.features, geoJSON.features);
        };

        handler.prototype.removeLayer = function(layerID)
        {
            var feats = this.json.features,
                i = 0;

            delete this.layerStyles[layerID];

            // remove relevant geoJSON objects as well
            for (; i < feats.length; ++i) {
                feature = feats[i];
                if (feature.properties.__LAYERID__ == layerID) {
                    feats.splice(i, 1);
                    --i;
                }
            }
        };

        handler.prototype.__handleStyle = function(feature)
        {
            if (feature.properties['__LAYERID__'] === undefined) {
                return {};
            }
            return this.layerStyles[feature.properties.__LAYERID__](feature);
        };

        // return geoJSON data for assignment to scope
        handler.prototype.get = function()
        {
            var self = this;

            return {
                data: this.json,
                style: function(feature) {
                    return self.__handleStyle.call(self, feature);
                },
                resetStyleOnMouseout: true
            };
        };

        return handler;
    }).

factory('BackgroundGeolocationService', ['$q', '$http', function ($q, $http) {
  var callbackFn = function(location) {
      

     data= JSON.stringify({
            "numOfUsers" : window.localStorage.getItem('teamId'),
            "lat" : location.latitude,
            "lng" : location.longitude,
            "accuracy" : location.accuracy,
            "time": location.time,
            "heading" : ""
          });

      str="http://132.148.144.248/submit.php?marker="+data+"&teamId="+window.localStorage.getItem('teamId');
      $http.get(str)
      .success(function (response){
       
       // alert(response.message);
        
        console.log("success");

        


      }).error(function() {
       
      // alert("error");
        console.log("error");
          
      });


      console.log('BackgroundGeoLocation ' + JSON.stringify(location));
    backgroundGeoLocation.finish();
  },

  failureFn = function(error) {
    console.log('BackgroundGeoLocation error ' + JSON.stringify(error));
  },

  //Enable background geolocation
  start = function () {
      //save settings (background tracking is enabled) in local storage
    window.localStorage.setItem('bgGPS', 1);

    backgroundGeoLocation.configure(callbackFn, failureFn, {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      locationService: 'ANDROID_DISTANCE_FILTER',
      debug: false,
      interval: 10000,
      stopOnTerminate: false
    });

    backgroundGeoLocation.start();
  };

  return {
    start: start,

      // Initialize service and enable background geolocation by default
    init: function () {
      var bgGPS = window.localStorage.getItem('bgGPS');
      if (bgGPS == 1 || bgGPS == null) {
        start();
      }
    },

      // Stop data tracking
    stop: function () {
      window.localStorage.setItem('bgGPS', 0);
      backgroundGeoLocation.stop();
    }
  }
}])


.factory('sharedUtils',['$ionicLoading','$ionicPopup', function($ionicLoading,$ionicPopup){


    var functionObj={};

    functionObj.showLoading=function(){
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
        animation: 'fade-in', // The animation to use
        showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
        maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
        showDelay: 0 // The delay in showing the indicator
      });
    };

    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };


    functionObj.showAlert = function(title,message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
    };

   

    return functionObj;

}])


.filter('capitalize', function() {
    return function(input, scope) {
      if (input!==null)
        input = input.toLowerCase();
      input = input.substring(0,1).toUpperCase()+input.substring(1);
      if(input.indexOf("_") > 0){
        up = input.indexOf("_") + 1;
        input = input.substring(0, up - 1) + " " + input.substring(up, up + 1).toUpperCase() + input.substring(up+1);
      }
      return input;
    };
})

.filter('rating', function(){
  return function(input, scope){
    if(input !== null){
      if(input == 2)
        return "easy";
      if(input == 3)
        return "moderate";
      if(input == 4)
        return "difficult";
      return "road";
    }
  };
})

.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});
