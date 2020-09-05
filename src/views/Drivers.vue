<template>
  <div class="home container px-0 mx-0">
    <input id="swipe" type="range" style="width: 100%" />
    <div id="map" class="map"></div>
    <!-- <div id="mouse-position">
      <div id="position"></div>
    </div>-->
    <!-- <form>
      <label>Projection</label>
      <select id="projection">
        <option value="EPSG:4326">EPSG:4326</option>
        <option value="EPSG:3857">EPSG:3857</option>
      </select>
      <label>Precision</label>
      <input id="precision" type="number" min="0" max="12" value="4" />
    </form>-->
  </div>
</template>

<script >
export default {
  name: "Drivers",
  data() {
    let initiated = window.ol;
    let resolveInitPromise = null;
    let rejectInitPromise = null;
    let initPromise = new Promise((resolve, reject) => {
      resolveInitPromise = resolve;
      rejectInitPromise = reject;
    });
    return {
      init: {
        initiated,
        runned: false,
        resolveInitPromise,
        rejectInitPromise,
        initPromise
      }
    };
  },
  mounted: async function() {
    let ol = await this.initation();
    var Map = ol.Map;
    var View = ol.View;
    var TileLayer = ol.layer.Tile;
    var fromLonLat = ol.proj.fromLonLat;
    // var BingMaps = ol.source.BingMaps;

    // var defaultControls = ol.control.defaults;
    // var MousePosition = ol.control.MousePosition;
    // var createStringXY = ol.coordinate.createStringXY;
    var OSM = ol.source.OSM;

    // get location
    // var mousePositionControl = new MousePosition({
    //   coordinateFormat: createStringXY(4),
    //   projection: "EPSG:4326",
    //   // comment the following two lines to have the mouse position
    //   // be placed within the map.
    //   className: "custom-mouse-position",
    //   target: document.getElementById("mouse-position"),
    //   undefinedHTML: "&nbsp;"
    // });
    var baseTilePath =
      // "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png";
      "https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"; //Google Road Map

    var transportTilesPath =
      //  "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";
      // "https://api.cedarmaps.com/v1/tiles/cedarmaps.streets/{z}/{x}/{y}.png?access_token=9e0dccb3f04d0b50261bfaa9079ba9ca586a5909"; //cedar map
      // "http://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"; //Google Road Map
      // "http://mt.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"; //Google map with traffic @221097413,traffic
      // "http://mt.google.com/vt/lyrs=m@221097413,transit&x={x}&y={y}&z={z}"; //Google map with transit @221097413,traffic
      // 'http://mt.google.com/vt/lyrs=h&x={x}&y={y}&z={z}'; //Google Road Names
      "https://mt.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}"; // Google Satellite
    // 'http://mt.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; //Google Satellite & Roads
    // 'http://mt.google.com/vt/lyrs=t&x={x}&y={y}&z={z}'; //Google Terrain
    // 'http://mt.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'; //Google Terrain & Roads
    // 'http://mt.google.com/vt/lyrs=r&x={x}&y={y}&z={z}'; //Google Road without Building
    var baselayer = new TileLayer({
      source: new OSM({ url: baseTilePath })
    });
    var secondlayer = new TileLayer({
      source: new OSM({ url: transportTilesPath })
    });
    var container = document.getElementById("map");

    var map = new Map({
      controls: [], //defaultControls().extend([mousePositionControl]),
      layers: [baselayer, secondlayer],
      target: container,
      view: new View({
        center: fromLonLat([-0.1318, 50.845]),
        zoom: 15,
        minZoom: 6,
        maxZoom: 28
      })
    });
    var swipe = document.getElementById("swipe");
    swipe.addEventListener(
      "input",
      function() {
        map.render();
      },
      false
    );
    secondlayer.on("precompose", function(event) {
      var ctx = event.context;
      var width = ctx.canvas.width * (swipe.value / 100);

      ctx.save();
      ctx.beginPath();
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      ctx.clip();
    });

    secondlayer.on("postcompose", function(event) {
      var ctx = event.context;
      ctx.restore();
      if (mousePosition) {
        var context = event.context;
        var pixelRatio = event.frameState.pixelRatio;
        var half = radius * pixelRatio;
        var centerX = mousePosition[0] * pixelRatio;
        var centerY = mousePosition[1] * pixelRatio;
        var originX = centerX - half;
        var originY = centerY - half;
        var size = 2 * half + 1;
        var sourceData = context.getImageData(originX, originY, size, size)
          .data;
        var dest = context.createImageData(size, size);
        var destData = dest.data;
        for (var j = 0; j < size; ++j) {
          for (var i = 0; i < size; ++i) {
            var dI = i - half;
            var dJ = j - half;
            var dist = Math.sqrt(dI * dI + dJ * dJ);
            var sourceI = i;
            var sourceJ = j;
            if (dist < half) {
              sourceI = Math.round(half + dI / 2);
              sourceJ = Math.round(half + dJ / 2);
            }
            var destOffset = (j * size + i) * 4;
            var sourceOffset = (sourceJ * size + sourceI) * 4;
            destData[destOffset] = sourceData[sourceOffset];
            destData[destOffset + 1] = sourceData[sourceOffset + 1];
            destData[destOffset + 2] = sourceData[sourceOffset + 2];
            destData[destOffset + 3] = sourceData[sourceOffset + 3];
          }
        }
        context.beginPath();
        context.arc(centerX, centerY, half, 0, 2 * Math.PI);
        context.lineWidth = 3 * pixelRatio;
        context.strokeStyle = "rgba(255,255,255,0.5)";
        context.putImageData(dest, originX, originY);
        context.stroke();
        context.restore();
      }
    });

    var radius = 150;
    document.addEventListener("keydown", function(evt) {
      if (evt.which === 38) {
        radius = Math.min(radius + 5, 150);
        map.render();
        evt.preventDefault();
      } else if (evt.which === 40) {
        radius = Math.max(radius - 5, 25);
        map.render();
        evt.preventDefault();
      }
    });

    // get the pixel position with every move
    var mousePosition = null;

    container.addEventListener("mousemove", function(event) {
      mousePosition = map.getEventPixel(event);
      map.render();
    });

    container.addEventListener("mouseout", function() {
      mousePosition = null;
      map.render();
    });

    // after rendering the layer, show an oversampled version around the pointer
    baselayer.on("postcompose", function(event) {
      if (mousePosition) {
        var context = event.context;
        var pixelRatio = event.frameState.pixelRatio;
        var half = radius * pixelRatio;
        var centerX = mousePosition[0] * pixelRatio;
        var centerY = mousePosition[1] * pixelRatio;
        var originX = centerX - half;
        var originY = centerY - half;
        var size = 2 * half + 1;
        var sourceData = context.getImageData(originX, originY, size, size)
          .data;
        var dest = context.createImageData(size, size);
        var destData = dest.data;
        for (var j = 0; j < size; ++j) {
          for (var i = 0; i < size; ++i) {
            var dI = i - half;
            var dJ = j - half;
            var dist = Math.sqrt(dI * dI + dJ * dJ);
            var sourceI = i;
            var sourceJ = j;
            if (dist < half) {
              sourceI = Math.round(half + dI / 2);
              sourceJ = Math.round(half + dJ / 2);
            }
            var destOffset = (j * size + i) * 4;
            var sourceOffset = (sourceJ * size + sourceI) * 4;
            destData[destOffset] = sourceData[sourceOffset];
            destData[destOffset + 1] = sourceData[sourceOffset + 1];
            destData[destOffset + 2] = sourceData[sourceOffset + 2];
            destData[destOffset + 3] = sourceData[sourceOffset + 3];
          }
        }
        context.beginPath();
        context.arc(centerX, centerY, half, 0, 2 * Math.PI);
        context.lineWidth = 3 * pixelRatio;
        context.strokeStyle = "rgba(255,255,255,0.5)";
        context.putImageData(dest, originX, originY);
        context.stroke();
        context.restore();
      }
    });

    // var projectionSelect = document.getElementById("projection");
    // projectionSelect.addEventListener("change", function(event) {
    //   mousePositionControl.setProjection(event.target.value);
    // });

    // var precisionInput = document.getElementById("precision");
    // precisionInput.addEventListener("change", function(event) {
    //   var format = createStringXY(event.target.valueAsNumber);
    //   mousePositionControl.setCoordinateFormat(format);
    // });
    // document.body.addEventListener("click", function() {
    //   document.getElementById("position").innerHTML = document.querySelector(
    //     ".custom-mouse-position"
    //   ).innerHTML;
    // });
  },
  async beforeDestroy() {},
  methods: {
    async initation() {
      let ini = this.init;
      if (ini.initiated) return new Promise(resolve => resolve(ini.initiated));
      if (ini.runned) return ini.initPromise;
      ini.runned = true;
      var head = document.querySelector("head");
      var linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "stylesheet");
      linkElement.setAttribute("type", "text/css");
      linkElement.setAttribute(
        "href",
        this.olcsspath ||
          "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/css/ol.css"
      );
      head.appendChild(linkElement);

      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src =
        this.oljspath ||
        "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/build/ol.js";
      var resolver = function resolver() {
        if (!window.ol) return window.setTimeout(resolver, 500);
        ini.resolveInitPromise(window.ol);
      };
      script.onload = resolver;
      script.onerror = ini.rejectInitPromise;
      head.appendChild(script);
      return ini.initPromise;
    }
  },
  computed: {}
};
</script>
<style scoped >
.container {
  max-width: 100%;
}
#swipe {
  position: absolute;
  top: 35px;
  left: 0px;
  z-index: 99;
}
#map {
  width: 100%;
  height: 100%;
}
</style>
