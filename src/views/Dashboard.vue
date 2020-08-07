<template>
  <div class="home w-100 px-0">
    <!-- :lines="{width:5,color:'blue',images:[{src: 'img/arrow.png'},{src: 'img/arrow.png'}]}" -->
    <olmap
      oljspath="vendors/openlayer.v.5.3.0/script.js"
      olcsspath="vendors/openlayer.v.5.3.0/style.css"
      mapUrl="http://mt.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
      :locations="locations"
      :lines="{width:5,color:'#e49af7c7'}"
      locationiqkey="188e59707db08f"
      :showme="true"
      @locationselected="addnewlocation"
      searchable="true"
    ></olmap>
    <div
      class="btn btn-danger"
      @click="clearalllocs"
      style="position:absolute;top:60px;left:10px;"
    >clear locations</div>
  </div>
</template>

<script>
import olmap from "@/components/olmap.vue";
export default {
  name: "Dashboard",
  components: {
    olmap
  },
  data() {
    return {
      locations: [
        // {
        //   id: 2,
        //   lat: 50.8543644,
        //   lng: -0.124605371092346,
        //   popuphtml:
        //     "<div>Hollingbury Park Golf Course, Ditchling Road, Hollingbury, Brighton, Brighton and Hove, South East, England, BN1 8GB, بریتانیا</div>",
        //   title: "loc_01"
        // },
        // {
        //   id: 1,
        //   title: "mo bandar",
        //   classes: ["test", 1],
        //   popuphtml: "<div>test</div>",
        //   image:
        //     "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
        //   // lineto: [
        //   //   {
        //   //     location_id: 2,
        //   //     info: { html: "<div>22km</div><div>12 Min</div>", location: 0.7 },
        //   //     line: {
        //   //       width: 5,
        //   //       color: "blue",
        //   //       images: [{ src: "img/arrow2.svg", location: 0.3 }]
        //   //     }
        //   //   }
        //   // ],
        //   lng: -0.1318,
        //   lat: 50.845
        // }
        // {
        //   id: 2,
        //   title: "babak",
        //   classes: [],
        //   popuphtml: "<div>test2</div>",
        //   // image:
        //   //   "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
        //   lng: -0.1399,
        //   lat: 50.845
        // },
        // {
        //   id: 3,
        //   title: "babak",
        //   classes: [],
        //   popuphtml: "<div>pickup</div>",
        //   lineto: [
        //     {
        //       location_id: 4,
        //       // info: { html: "<div>22km</div><div>12 Min</div>", location: 0.7 },
        //       style: {
        //         width: 5,
        //         color: "#e49af7c7",
        //         images: []
        //       },
        //       geometry:
        //         "}yfuHlgYtFn@bA_C`AbAtAX~Ch@zCIvFnClFz@~ElBtMrAzCC~@y@f@bBFfM{BvMcBrSiMbkAqF|u@iCxf@yCq@"
        //     }
        //   ],
        //   lng: -0.134679799999958,
        //   lat: 50.8305693
        // },
        // {
        //   id: 4,
        //   title: "babak",
        //   classes: [],
        //   popuphtml: "<div>pickup</div>",
        //   // image:
        //   //   "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
        //   lng: -0.171527,
        //   lat: 50.825432
        // }
      ]
    };
  },
  mounted() {},
  async beforeDestroy() {},
  methods: {
    addnewlocation(loc) {
      // {
      //   id: 3,
      //   title: "babak",
      //   classes: [],
      //   popuphtml: "<div>pickup</div>",
      //   lineto: [
      //     {
      //       location_id: 4,
      //       // info: { html: "<div>22km</div><div>12 Min</div>", location: 0.7 },
      //       style: {
      //         width: 5,
      //         color: "#e49af7c7",
      //         images: []
      //       },
      //       geometry:
      //         "}yfuHlgYtFn@bA_C`AbAtAX~Ch@zCIvFnClFz@~ElBtMrAzCC~@y@f@bBFfM{BvMcBrSiMbkAqF|u@iCxf@yCq@"
      //     }
      //   ],
      //   lng: -0.134679799999958,
      //   lat: 50.8305693
      // },
      let thisid = this.locations.length + 1;
      let newloc = {
        id: thisid,
        classes: ["location"],
        title: "loc_" + thisid,
        popuphtml: loc.display_name,
        lng: parseFloat(loc.lon),
        lat: parseFloat(loc.lat)
      };
      if (thisid > 1) {
        newloc.routeto = [
          {
            location_id: thisid - 1,
            // info: { html: "<div>22km</div><div>12 Min</div>", location: 0.7 },
            style: {
              width: 5,
              color: "blue",
              images: []
            }
          }
        ];
      }
      this.locations.push(newloc);
      console.log(this.locations);
    },
    clearalllocs() {
      this.locations = [];
    }
  },
  computed: {}
};
</script>

<style lang="scss" scoped >
.home {
  max-width: 100%;
}
/deep/ .location .olpin-popup {
  top: -7px;
}
/deep/ .location .popup-container {
  position: absolute;
  width: 170px;
  left: -85px;
  bottom: 0;
}
</style>
