<template>
  <div id="olmap-container">
    <div id="olmap"></div>
    <div id="olsearch" v-if="searchable">
      <div class="boxcontainer">
        <input
          class="searchinput"
          @keyup="$event.keyCode == 13 ? selectlocation():searchlocation()"
          v-model="search.text"
          type="text"
          placeholder="Post Code"
        />
        <div class="ol-clearsearchbox" v-if="search.text" @click="clearselect">x</div>
        <div class="locateme" @click="locateme()">•</div>
        <div class="autoresults">
          <div
            class="autoresult"
            v-for="(sr,sri) in search.autocompleteresult"
            :key="sri"
            :title="sr.display_address"
            @click="selectlocation(sr)"
          >{{sr.address.postcode}}, {{sr.display_address}}</div>
        </div>
      </div>
    </div>
    <div id="olmap-popup" v-show="popup.show">
      <div class="detail">
        <div class="popupcontent">
          <div class="header">
            <h5 style="margin:0;text-transform: capitalize;">{{popup.title}}</h5>
            <span class="closebtn" @click="clearselect">x</span>
          </div>
          <div v-if="!popup.location">
            <svg
              width="40"
              height="10"
              viewBox="0 0 120 30"
              xmlns="http://www.w3.org/2000/svg"
              fill="#222"
            >
              <circle cx="15" cy="15" r="15">
                <animate
                  attributeName="r"
                  from="15"
                  to="15"
                  begin="0s"
                  dur="0.8s"
                  values="15;9;15"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  from="1"
                  to="1"
                  begin="0s"
                  dur="0.8s"
                  values="1;.5;1"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="60" cy="15" r="9" fill-opacity="0.3">
                <animate
                  attributeName="r"
                  from="9"
                  to="9"
                  begin="0s"
                  dur="0.8s"
                  values="9;15;9"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  from="0.5"
                  to="0.5"
                  begin="0s"
                  dur="0.8s"
                  values=".5;1;.5"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="105" cy="15" r="15">
                <animate
                  attributeName="r"
                  from="15"
                  to="15"
                  begin="0s"
                  dur="0.8s"
                  values="15;9;15"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  from="1"
                  to="1"
                  begin="0s"
                  dur="0.8s"
                  values="1;.5;1"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
          <div class="content" v-else>
            <span>{{popup.location}}</span>
            <!-- <span v-for="(v,k) in location" :key="k">
              <strong>{{k}}:</strong>
              {{v}}
            </span>-->
          </div>
        </div>
      </div>
    </div>
    <div id="lineinfo"></div>
    <div id="ol-showme" v-if="showme == undefined || showme" @click="pantome()">•</div>
    <div id="ol-showall" @click="showall()">[ ]</div>
  </div>
</template>

<script>
import { Promise } from "q";
export default {
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
      },
      popup: {
        location: "",
        title: "",
        show: false
      },
      pins: [],
      // mapextend: null,
      search: {
        text: "",
        autocompleteresult: [],
        selectedlocation: null,
        element: null,
        overlay: null
      },
      me: {
        location: null,
        overlay: null,
        visible: true
      },
      cachedroutes: [],
      cachednearest: []
    };
  },
  /*
   locations is array of 
        {
          id: 1, //mandatory to undentify and update location
          title: "mo bandar", //title to show below pin
          classes: ["test", 1], classes to add at top level pin
          popuphtml: "<div>test</div>", // popup html
          image: //image on the pin
            "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
          lineto|routeto: [
            {
              location_id: 2, // mandatory
              info:{html: "<div>distance: 22km,time: 12 Min</div>"",location}, // only for lines
              line: { // override lines config
                width: 5,
                color: "red",
                images: [{ src: "/img/arrow.png", location: 0.3 }] //only for lines
              },
              geometry: 'geometry string'
            }
          ],
          lng: -0.1318, //location of pin
          lat: 50.845  //location of pin
        },
        
      oljspath="/vendors/openlayer.v.5.3.0/script.js"  // path to local openlayer
      olcsspath="/vendors/openlayer.v.5.3.0/style.css" // path to local openlayer
      locationiqkey="188e59707db08f" //locationiq token
      :locations="locations" // location array
      :lines="{width:5,color:'red',images:[{src: '/img/arrow.png'},{src: '/img/arrow.png'}]}"
      :click="clicktoshow" //enable click to show info of location = fulladdress | postcode | country| city
      @locationselected="selectedlocationchange" //event on location select
      searchable="true" // search box and search location
      :showme="true"  // show me button
        
        */
  props: [
    "oljspath",
    "olcsspath",
    "mapUrl",
    "click",
    "locations",
    "linestyle",
    "searchable",
    "locationiqkey",
    "showme"
  ],
  async created() {
    this.olmap = await this.initation();
  },
  async mounted() {
    this.olmap = await this.initation();

    let ol = this.olmap;
    let baseTilePath =
      this.mapUrl || "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"; //default openstreet map

    var baselayer = new ol.layer.Tile({
      source: new ol.source.OSM({ url: baseTilePath })
    });
    window.baselayer = baselayer;
    this.map = new ol.Map({
      controls: [],
      // controls: ol.control
      //   .defaults()
      //   .extend([new ol.control.OverviewMap(), new ol.control.FullScreen()]),
      layers: [baselayer],
      target: "olmap",
      view: new ol.View({
        center: ol.proj.fromLonLat([51.3747296,35.6938534]),
        zoom: 10,
        minZoom: 2,
        maxZoom: 18
      })
    });
    window.thismap = this.map;
    if (this.locations) this.draw();
    if (this.click || this.searchable) this.bindpopup();

    this.me.visible = this.showme == undefined ? true : this.showme;
    this.showhideme();
  },
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
    },
    draw: async function() {
      let ol = this.olmap;
      let Overlay = ol.Overlay;
      let fromLonLat = ol.proj.fromLonLat;
      let toLonLat = ol.proj.toLonLat;
      let Point = ol.geom.Point;
      let zindexoverlay = ev => {
        let thiscontainer = ev.target.closest(".ol-overlay-container");
        let prevelem = thiscontainer.parentElement.getElementsByClassName(
          "ol-pin-active"
        )[0];
        if (prevelem) prevelem.classList.remove("ol-pin-active");
        thiscontainer.classList.add("ol-pin-active");
        let pin = ev.target.closest(".olpins");
        if (pin) {
          let childpopup = pin.querySelector(".olpin-popup");
          let pcontainer = pin.querySelector(".olpin-popup .popup-container");
          childpopup.style.display =
            pcontainer.innerHTML && childpopup.style.display == "none"
              ? "flex"
              : "none";
        }
      };

      //draw pines
      this.pins.forEach(p => {
        if (!this.locations.find(l => l.id == p.id)) {
          this.map.removeOverlay(p.overlay);
          p = null;
        }
      });
      // this.mapextend = ol.extend.createEmpty();
      this.pins = this.pins.filter(p =>
        (this.locations || []).find(l => l.id == p.id)
      );
      for (let l of this.locations) {
        if (!l.lng || !l.lat) continue;
        let coordinate = fromLonLat([l.lng, l.lat]);
        let currPin = this.pins.find(p => p.id == l.id);
        if (!currPin) {
          let domElement = document.createElement("div");
          domElement.id = "olpins-" + l.id;
          currPin = {
            id: l.id,
            domElement
          };
          let olpin = document.createElement("div");
          olpin.classList = ["olpin"];
          let olpinimg = document.createElement("img");
          olpinimg.classList = ["olpin-img"];
          olpin.appendChild(olpinimg);
          domElement.appendChild(olpin);

          let olpinpopup = document.createElement("div");
          olpinpopup.classList = ["olpin-popup"];
          olpinpopup.style.display = "none";
          let olpinpopupcontainer = document.createElement("div");
          olpinpopupcontainer.classList = ["popup-container"];
          olpinpopup.appendChild(olpinpopupcontainer);
          domElement.appendChild(olpinpopup);

          let olpintitle = document.createElement("div");
          olpintitle.classList = ["title"];
          domElement.appendChild(olpintitle);

          domElement.onclick = ev => {
            zindexoverlay(ev);
          };
          this.pins.push(currPin);
          currPin.overlay = new Overlay({
            element: domElement,
            positioning: "center-center",
            dragging: true
          });
          this.map.addOverlay(currPin.overlay);
        }

        currPin.overlay.setPosition(coordinate);
        // currPin.lineto = l.lineto
        let ele = currPin.domElement;
        if (l.classes && !Array.isArray(l.classes)) l.classes = [l.classes];
        ele.classList = [];
        [...(l.classes || []), "olpins"].forEach(c => ele.classList.add(c));
        let olpin = ele.querySelector(".olpin");
        let olpinimg = ele.querySelector(".olpin .olpin-img");
        let olpinpopup = ele.querySelector(".olpin-popup");
        if (!l.image) {
          ele.classList.contains("noimage") || ele.classList.add("noimage");
          olpin.classList.contains("noimage") || olpin.classList.add("noimage");
          olpinimg.style.display = "none";
          olpinpopup.classList.contains("noimage") ||
            olpinpopup.classList.add("noimage");
        } else {
          ele.classList.contains("noimage") && ele.classList.remove("noimage");
          olpin.classList.contains("noimage") &&
            olpin.classList.remove("noimage");
          olpinimg.style.display = "block";
          olpinimg.src = l.image;
          olpinpopup.classList.contains("noimage") &&
            olpinpopup.classList.remove("noimage");
        }
        olpinpopup.querySelector(".popup-container").innerHTML =
          l.popuphtml || "";
        ele.querySelector(".title").innerHTML = l.title || "";
      }

      // draw lines
      if (this.lineslayer) this.map.removeLayer(this.lineslayer);
      if (this.lineoverlays) {
        this.lineoverlays.forEach(lo => this.map.removeOverlay(lo));
      }
      this.lineoverlays = [];
      if (this.locations.find(l => l.lineto)) {
        let source = new ol.source.Vector();
        let vector = new ol.layer.Vector({
          source
        });
        this.lineslayer = vector;
        this.map.addLayer(vector);
        for (let l of this.locations) {
          if (!l.lineto) continue;

          let startpin = this.pins
            .find(p => p.id == l.id)
            .overlay.getPosition();
          if (!Array.isArray(l.lineto)) l.lineto = [l.lineto];

          for (let lineto of l.lineto) {
            if (!this.pins.find(p => p.id == lineto.location_id)) continue;
            let finishpin = this.pins
              .find(p => p.id == lineto.location_id)
              .overlay.getPosition();
            let linesetting = {
              ...{
                color: "red",
                width: 5,
                images: {
                  src:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAATCAYAAACk9eypAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TS0UrDnYQcQhSnSyKijhKFYtgobQVWnUwufRDaNKQpLg4Cq4FBz8Wqw4uzro6uAqC4AeIi6uToouU+L+k0CLGg+N+vLv3uHsHCPUyU82OcUDVLCMVj4nZ3IoYfEUQ3QhgDEMSM/VEeiEDz/F1Dx9f76I8y/vcn6NHyZsM8InEs0w3LOJ14ulNS+e8TxxmJUkhPiceNeiCxI9cl11+41x0WOCZYSOTmiMOE4vFNpbbmJUMlXiKOKKoGuULWZcVzluc1XKVNe/JXxjKa8tprtMcRByLSCAJETKq2EAZFqK0aqSYSNF+zMM/4PiT5JLJtQFGjnlUoEJy/OB/8LtbszA54SaFYkDgxbY/hoHgLtCo2fb3sW03TgD/M3CltfyVOjDzSXqtpUWOgN5t4OK6pcl7wOUO0P+kS4bkSH6aQqEAvJ/RN+WAvluga9XtrbmP0wcgQ10t3QAHh8BIkbLXPN7d2d7bv2ea/f0Ai11ysXD1QvQAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfjBwsFNBiXqDHXAAABGElEQVQoz32TsUpDQRBFz0tiEAwIESzsrETsLMRWeyvFD/APrKxT+gUKtvZaCWJhmVZQ0cJaREVBhMQYc2x2YV3fy8CwzT0zd4ZZBIVReG+EdaFBVQgfQRzBW2FLmKgCFHoJ9CM8CrvCZBnwGkTfWae+0BHaQpECO8KzMAxgCn0Jh8KiUI9AU9gW7gM0yqCecCaspFBDWBO6wiCD4owXwmpqrS4sCUfCZ+iWQkPhIV9AIcwF34PMmoJlWyuEWeE861AJTAn7wnte/R8gtITjkm3FfIrCmjAvnAZhLh4Jl8JMFC8LV2UWQrcDoRWrbwjXFZX7wt6fmxLeKiq/CJtCs+xa87wTFoRa1Xmn2RXa4z5QOtyJMM2Y+AXxWiXWlbxGoQAAAABJRU5ErkJggg==",
                  anchor: [0.75, 0.5],
                  rotateWithView: true
                },
                ...(this.linestyle || {}),
                ...(lineto.style || {})
              }
            };
            if (!Array.isArray(linesetting.images))
              linesetting.images = [linesetting.images];
            var points = [startpin, finishpin];
            var dx = finishpin[0] - startpin[0];
            var dy = finishpin[1] - startpin[1];
            var rotation = Math.atan2(dy, dx);
            let featrueLine;
            if (lineto.geometry) {
              featrueLine = new ol.Feature({
                type: "route",
                geometry: new ol.format.Polyline({
                  factor: 1e5
                }).readGeometry(lineto.geometry, {
                  dataProjection: "EPSG:4326",
                  featureProjection: "EPSG:3857"
                })
              });
              console.log(featrueLine);
            } else {
              featrueLine = new ol.Feature({
                geometry: new ol.geom.LineString(points)
              });
            }

            let styles = linesetting.images.map((lsimg, i, ar) => {
              let loc = lsimg.location || (1 / (ar.length + 1)) * (i + 1);
              let midpoint = [
                loc * finishpin[0] + (1 - loc) * startpin[0],
                loc * finishpin[1] + (1 - loc) * startpin[1]
              ];

              return new ol.style.Style({
                geometry: new Point(midpoint),
                image: new ol.style.Icon({
                  src: lsimg.src,
                  anchor: lsimg.anchor,
                  rotateWithView:
                    lsimg.rotateWithView == undefined
                      ? true
                      : lsimg.rotateWithView,
                  rotation: -rotation
                })
              });
            });

            styles.unshift(
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: linesetting.color || "red",
                  width: linesetting.width || 5
                })
              })
            );
            featrueLine.setStyle(styles);

            source.addFeature(featrueLine);

            if (!lineto.info) continue;
            let element = document.getElementById("lineinfo").cloneNode(true);
            element.classList.add("lineinfo");
            element.innerHTML = (lineto.info.html || "").trim();
            element.onclick = zindexoverlay;
            let loc = lineto.info.location || 0.5;
            let position = [
              loc * finishpin[0] + (1 - loc) * startpin[0],
              loc * finishpin[1] + (1 - loc) * startpin[1]
            ];
            let lineinfo = new Overlay({
              element,
              position,
              positioning: "center-center"
            });
            this.lineoverlays.push(lineinfo);
            this.map.addOverlay(lineinfo);
          }
        }
      }

      // draw routes

      if (this.routeslayer) this.map.removeLayer(this.routeslayer);
      if (!this.locations.find(l => l.routeto)) return;
      let routeSource = new ol.source.Vector();
      let routeVector = new ol.layer.Vector({
        source: routeSource
      });
      this.routeslayer = routeVector;
      this.map.addLayer(routeVector);
      for (let l of this.locations) {
        if (!l.routeto) continue;
        let startpin = this.pins.find(p => p.id == l.id).overlay.getPosition();
        if (!Array.isArray(l.routeto)) l.routeto = [l.routeto];
        for (let routeto of l.routeto) {
          if (!this.pins.find(p => p.id == routeto.location_id)) continue;
          let finishpin = this.pins
            .find(p => p.id == routeto.location_id)
            .overlay.getPosition();
          try {
            this.getroute(
              toLonLat(startpin).join(),
              toLonLat(finishpin).join()
            ).then(result => {
              let route = new ol.format.Polyline({
                factor: 1e5
              }).readGeometry(result[0].geometry, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857"
              });
              let routesetting = {
                ...{
                  color: [40, 40, 40, 0.8],
                  width: 5,
                  ...(this.linestyle || {}),
                  ...(routeto.style || {})
                }
              };
              let featureRoute = new ol.Feature({
                type: "route",
                geometry: route
              });
              featureRoute.setStyle(
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: routesetting.color,
                    width: routesetting.width
                  }),
                  geometry: route,

                  zIndex: 99
                })
              );
              routeSource.addFeature(featureRoute);
            });
          } catch {
            continue;
          }
        }
      }
    },
    getnearest(loc) {
      let _self = this;
      return new Promise((resolve, reject) => {
        let url_osrm_nearest = "//router.project-osrm.org/nearest/v1/driving/";
        let thisnearest = this.cachednearest.find(cn => cn.id == loc);
        if (thisnearest) {
          return resolve(thisnearest.result);
        } else {
          window
            .fetch(url_osrm_nearest + loc, { cache: "no-store" })
            .then(r => r.json())
            .then(res => {
              if (res.code != "Ok")
                return reject("near location" + loc + "not found");
              let result = res.waypoints[0];
              if (_self.cachednearest.length > 60)
                _self.cachednearest = _self.cachednearest.slice(1);
              _self.cachednearest.push({ id: loc, result });
              resolve(result);
            });
        }
      });
    },
    getroute(start, finish) {
      let _self = this;
      let id = start + ";" + finish;
      let url_osrm_route = "//router.project-osrm.org/route/v1/driving/";
      return new Promise((resolve, reject) => {
        let thisroute = _self.cachedroutes.find(cr => cr.id == id);
        if (thisroute) {
          return resolve(thisroute.result);
        } else {
          // new Promise.all([_self.getnearest(start), _self.getnearest(finish)])
          //   .then(result => {
          fetch(
            url_osrm_route +
              // result[0].location + ";" + result[1].location
              id
          )
            .then(r => r.json())
            .then(result => {
              if (result.code != "Ok") return reject("route not ok");
              thisroute = result.routes;
              if (_self.cachedroutes.length > 30)
                _self.cachedroutes = _self.cachedroutes.slice(1);
              _self.cachedroutes.push({
                id,
                result: thisroute
              });
              return resolve(thisroute);
              // });
            })
            .catch(() => reject("can't get route"));
        }
      });
    },
    bindpopup() {
      if (!this.click && !this.searchable)
        return this.map.un("click", this.clickpopup);
      if (!this.popup.overlay) {
        this.popup.overlay = new this.olmap.Overlay({
          id: "loc-popup",
          element: document.getElementById("olmap-popup")
        });
        this.map.addOverlay(this.popup.overlay);
      }
      this.map.on("click", this.clickpopup);
    },
    async clickpopup(evt) {
      let clickval = this.click;
      if (!clickval) clickval = "fulladdress";
      let toLonLat = this.olmap.proj.toLonLat;
      this.popup.location = "";
      let coordinate = evt.coordinate;
      let latlng = toLonLat(coordinate || []);
      this.popup.title = clickval;
      this.popup.show = true;
      this.popup.overlay.setPosition(coordinate);
      let result = evt.result;
      if (!result) {
        let resp = await window.fetch(
          `https://eu1.locationiq.com/v1/reverse.php?key=${
            this.locationiqkey
          }&format=json&lat=${latlng[1]}&lon=${latlng[0]}&addressdetails=1`
        );
        result = await resp.json();
      }
      if (!result.error) {
        this.selectedlocation = result;
        this.search.text = this.selectedlocation.display_name;
        this.search.autocompleteresult = [];
      }
      if (clickval == "fulladdress") {
        this.popup.location = result.display_name;
        this.popup.title = "Full Address";
      } else {
        this.popup.location = result.address[clickval];
      }
      this.$emit("locationselected", result.error ? null : result);
      this.map.getView().animate({ center: coordinate, duration: 500 });
    },
    showpopup(p) {
      p.showpopup = !p.showpopup;
      this.$forceUpdate();
    },
    showall() {
      let overlayarray = this.map.getOverlays().getArray();
      if (!overlayarray.length)
        return this.map.getView().setZoom(this.map.getView().getMinZoom());
      let extent = this.olmap.extent.boundingExtent(
        overlayarray
          .map(o => (o.id != "loc-popup" ? o.getPosition() : null))
          .filter(o => o)
      );
      this.map.getView().fit(extent);
    },
    searchlocation() {
      this.popup.show = false;
      if (this.autocomptimeout) window.clearTimeout(this.autocomptimeout);
      let s = this.search.text;
      this.search.autocompleteresult = [];
      if (!s || s.length < 3) return;
      let _self = this;
      this.autocomptimeout = window.setTimeout(async () => {
        let resp = await window.fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=${this.locationiqkey}&q=${s}`
        );
        let result = await resp.json();
        if (Array.isArray(result)) {
          _self.search.autocompleteresult = result;
        }
      }, 400);
    },
    selectlocation(sl) {
      let fromLonLat = this.olmap.proj.fromLonLat;
      if (!sl && this.search.autocompleteresult.length)
        sl = this.search.autocompleteresult[0];
      this.selectedlocation = sl;
      if (!this.selectedlocation) return;
      this.clickpopup({
        coordinate: fromLonLat([parseFloat(sl.lon), parseFloat(sl.lat)]),
        result: sl
      });
      this.search.text = sl.display_name;
      this.search.autocompleteresult = [];
    },
    locateme() {
      let fromLonLat = this.olmap.proj.fromLonLat;
      let _self = this;
      if (this.me.location) {
        return this.clickpopup({
          coordinate: _self.me.location
        });
      }
      window.navigator.geolocation.getCurrentPosition(
        pos => {
          pos.lat = pos.coords.latitude;
          pos.lng = pos.coords.longitude;
          this.clickpopup({
            coordinate: fromLonLat([
              parseFloat(pos.coords.longitude),
              parseFloat(pos.coords.latitude)
            ])
          });
        },
        () => {
          window.toastr.error("Allow access to location", "Error");
        }
      );
    },
    clearselect() {
      this.popup.show = false;
      this.search.text = "";
      this.search.selectedlocation = null;
      this.search.autocompleteresult = [];
      this.popup.location = "";
    },
    pantome() {
      if (!this.me.location) return;
      this.map.getView().animate({ center: this.me.location, duration: 500 });
    },
    async showhideme() {
      let _self = this;
      let fromLonLat = this.olmap.proj.fromLonLat;
      if (!this.me.visible) {
        if (this.me.overlay) this.map.removeOverlay(this.me.overlay);
        this.me.location = null;
        return;
      }
      if (!this.me.location) {
        let loc = await new Promise(resolve => {
          window.navigator.geolocation.getCurrentPosition(
            pos => {
              this.me.location = fromLonLat([
                parseFloat(pos.coords.longitude),
                parseFloat(pos.coords.latitude)
              ]);
              this.me.watchfuncres = pos => {
                this.me.location = fromLonLat([
                  parseFloat(pos.coords.longitude),
                  parseFloat(pos.coords.latitude)
                ]);
                resolve(true);
              };
              this.me.watchfuncrej = () => {
                window.toastr.error("Error reading location", "Error");
                resolve(false);
              };
              window.navigator.geolocation.watchPosition(
                this.me.watchfuncres,
                this.me.watchfuncrej
              );
            },
            () => {
              window.toastr.error("Allow access to location", "Error");
              resolve(false);
            }
          );
        });
        if (!loc) return;
      }
      if (!this.me.overlay) {
        let element = document.createElement("div");
        element.classList.add("mebullet");
        this.me.overlay = new this.olmap.Overlay({
          element,
          positioning: "center-center",
          position: _self.me.location
        });
        this.map.addOverlay(this.me.overlay);
      }
    }
  },
  watch: {
    async locations() {
      await this.initation();
      this.draw();
    },
    async line() {
      await this.initation();
      this.draw();
    },
    async click() {
      await this.initation();
      this.bindpopup();
    },
    async searchable() {
      await this.initation();
      this.bindpopup();
    },
    async showme(val) {
      await this.initation();
      this.me.visible = val == undefined ? true : val;
      this.showhideme();
    },
    "me.location": async function() {
      await this.initation();
      if (this.me.overlay && this.me.location)
        this.me.overlay.setPosition(this.me.location);
    }
  }
};
</script>

<style lang="scss">
#olmap-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  padding: 0;
  margin: 0;
}
#olmap {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  padding: 0;
  margin: 0;
}
#olmap-popup {
  z-index: 99;
  width: 10px;
  height: 10px;
  background: #001fff;
  border-radius: 50%;
  position: relative;
  transform: translate(-50%, -50%);
  .detail {
    position: absolute;
    min-width: 250px;
    transform: translate(calc(-50% + 5px), calc(-100% - 7px));
    box-shadow: 0 0 5px 2px gray;
    border-radius: 7px;
    .popupcontent {
      border-radius: 7px;
      background: white;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .header {
        background: #e4e0e0;
        color: black;
        padding: 7px;
      }
      .content {
        background: white;
        padding: 7px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        text-align: left;
        max-height: 250px;
        overflow-y: auto;
      }
    }
    &:after {
      z-index: -1;
      box-shadow: 0 0 5px 2px gray;
      width: 10px;
      height: 10px;
      content: "";
      position: absolute;
      bottom: -5px;
      left: calc(50% - 5px);
      transform: rotateZ(45deg);
      background: white;
    }
  }
}
.olpins {
  position: relative;
  width: 15px;
  border: 3px solid black;
  height: 8px;
  border-radius: 50%;
  &.noimage {
    border: none;
  }
  .olpin {
    position: absolute;
    bottom: 13px;
    left: -26px;
    width: 60px;
    height: 60px;
    background-color: red;
    box-shadow: 1px -3px 6px 2px grey;
    border-radius: 50% 50% 0 50%;
    transform: rotateZ(45deg);
    display: flex;
    justify-content: center;
    align-items: center;
    &.noimage {
      left: 0;
      bottom: 0;
      width: 10px;
      height: 10px;
      border: none;
      background-color: red;
      border-radius: 50%;
      box-shadow: none;
    }
    .olpin-img {
      transform: rotateZ(-45deg);
      width: 80%;
      height: 80%;
      border-radius: 50%;
    }
  }
  .title {
    position: absolute;
    // background: rgba(255, 255, 255, 0.493);
    text-shadow: 3px 3px 4px grey;
    font-weight: 600;
    white-space: nowrap;
    top: 5px;
    transform: translateX(calc(-50% + 7px));
  }
  .olpin-popup {
    position: absolute;
    bottom: 85px;
    box-shadow: 0 0 5px 2px gray;
    transform: translateX(calc(-50% + 7px));
    &.noimage {
      top: -35px;
    }
    .popup-container {
      position: relative;
      background-color: white;
      z-index: 2;
    }
    &:before {
      z-index: 1;
      box-shadow: 0 0 5px 2px gray;
      width: 10px;
      height: 10px;
      content: "";
      position: absolute;
      bottom: -5px;
      left: calc(50% - 5px);
      transform: rotateZ(45deg);
      background: white;
    }
  }
}
.lineinfo {
  background-color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 5px;
  box-shadow: 0 0 5px gray;
}
.ol-pin-active {
  z-index: 99;
}

.closebtn {
  position: absolute;
  top: -15px;
  right: -15px;
  border-radius: 50%;
  background-color: white;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border: 1px solid gray;
  color: gray;
}
#olsearch {
  position: absolute;
  top: 15px;
  left: 0;
  left: 5%;
  width: 90%;
  display: flex;
  justify-content: center;
  .ol-clearsearchbox {
    position: absolute;
    top: 5px;
    right: 37px;
    z-index: 88;
    color: red;
    font-size: 18px;
    font-weight: bold;
    border-radius: 50%;
    background-color: white;
    width: 20px;
    box-shadow: 0 0 5px grey;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .boxcontainer {
    position: relative;
    display: flex;
    justify-content: center;
    background: white;
    box-shadow: 0 0 5px gray;
    height: 30px;
    width: 60%;
    min-width: 250px;
    .searchinput {
      border: none;
      width: calc(100% - 30px);
      padding-left: 15px;
    }
    .locateme {
      min-width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32px;
      border-left: 1px solid gray;
      cursor: pointer;
      user-select: none;
    }
    .autoresults {
      position: absolute;
      top: 30px;
      left: 0;
      width: 100%;
      background-color: white;
      max-height: 200px;
      overflow-y: auto;
      .autoresult {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 5px;
        font-size: 13px;
        font-weight: bold;
        text-align: left;
        border-top: 1px solid gray;
        color: gray;
      }
    }
  }
}

.olsearch-overlay {
  width: 20px;
  height: 20px;
  background-color: blue;
}
#ol-showall,
#ol-showme {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 0 5px gray;
  border: 1px solid gray;
  cursor: pointer;
  user-select: none;
  transition: 0.2s;
  &:active {
    box-shadow: 0 0 0px gray;
    transform: scale(0.9);
  }
}
#ol-showme {
  bottom: 55px;
  font-size: 32px;
}
.mebullet {
  width: 10px;
  height: 10px;
  background-color: blue;
  border-radius: 50%;
}
</style>
