<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Project | </span>
        <span class="rainbow-text">RAINBOW</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        href="https://www.artificial-solutions.com/"
        target="_blank"
      >
        <span class="mr-2">Created with Teneo</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <Bulbs />
    </v-content>
  </v-app>
</template>

<script>
import Bulbs from "./components/Bulbs";

export default {
  name: "App",
  components: {
    Bulbs
  },
  data() {
    return {
      //
    };
  }
};
</script>

<style>
.rainbow-text {
  background-image: linear-gradient(
    to left,
    violet,
    indigo,
    blue,
    green,
    orange,
    red
  );
  -webkit-background-clip: text;
  color: transparent;
}
</style>




