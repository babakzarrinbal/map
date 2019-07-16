<template>
  <div class="home w-100 px-0">
    <olmap
      oljspath="/vendors/openlayer.v.5.3.0/script.js"
      olcsspath="/vendors/openlayer.v.5.3.0/style.css"
      :locations="locations"
      :lines="{width:5,color:'red',images:[{src: '/img/arrow.png'},{src: '/img/arrow.png'}]}"
      :click="clicktoshow"
      @locationselected="selectedlocationchange"
      locationiqkey="188e59707db08f"
      :showme="true"
      searchable="true"
    ></olmap>
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
        {
          id: 1,
          title: "mo bandar",
          classes: ["test", 1],
          popuphtml: "<div>test</div>",
          image:
            "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
          lineto: [
            {
              location_id: 2,
              info: { html: "<div>22km</div><div>12 Min</div>", location: 0.7 },
              line: {
                width: 5,
                color: "blue",
                images: [{ src: "/img/arrow2.svg", location: 0.3 }]
              }
            }
          ],
          lng: -0.1318,
          lat: 50.845
        },
        {
          id: 2,
          title: "babak",
          classes: [],
          popuphtml: "<div>test2</div>",
          // image:
          //   "http://localhost:3007/uploads/images/others/1560843546728.jpeg",
          lng: -0.1399,
          lat: 50.845
        }
      ]
    };
  },
  mounted() {},
  async beforeDestroy() {},
  methods: {},
  computed: {}
};
</script>

<style lang="scss" scoped >
.home {
  max-width: 100%;
}
</style>
