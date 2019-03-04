<template>

  <div
    id="e3"
    class="grey lighten-3"
  >
    <v-toolbar
      color="black"
      dark
    >
      <v-toolbar-title>Control these bulbs using your voice
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        v-shortkey="{recordAudioOne: ['ctrl', 'alt', '.'], recordAudioTwo: ['ctrl', 'alt', '`'], recordAudioThree: ['ctrl', 'alt', 'arrowup']}"
        @shortkey.native="captureAudio"
        :color="audioButtonColor"
        :class="audioButtonClasses"
        @click.native="captureAudio"
      >
        <v-icon
          color="red"
          large
        >mic</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card>
      <v-container
        fluid
        grid-list-lg
      >
        <v-layout
          row
          wrap
        >

          <v-flex
            v-for="(bulb, i) in bulbs"
            :key="i"
            xs2
          >
            <v-card
              :color="bulb.active ? bulb.color : ''"
              class="black--text"
            >
              <v-layout row>
                <v-flex xs7>
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">{{ i + 1 }}</div>
                      <div>{{ bulb.active ? 'On' : 'Off'}}</div>
                      <div>{{ bulb.color }}</div>
                    </div>
                  </v-card-title>
                </v-flex>
                <v-flex xs5>
                  <v-img
                    :src="require('../assets/bulb.png')"
                    contain
                    min-height="125"
                    height="125"
                  ></v-img>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>

        </v-layout>
      </v-container>
    </v-card>
    <!-- <teneo-listening
      v-bind:value="listening"
      message="Listening"
    ></teneo-listening> -->
    <Listening
      v-bind:value="listening"
      message="Listening"
    ></Listening>

    <v-text-field
      v-model="userInput"
      label="Control the Lights. Ask me questions."
    ></v-text-field>
    <v-btn @click="sendUserInput">Send</v-btn>
  </div>
</template>

<script>
import Listening from "./Listening";
export default {
  components: {
    Listening
  },
  data() {
    return {
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "success"
    };
  },
  computed: {
    bulbs() {
      return this.$store.getters.bulbs;
    },
    listening() {
      return this.$store.state.listening;
    },
    userInput: {
      get: function() {
        if (this.$store.state.userInputReadyForSending) {
          this.$store.state.userInputReadyForSending = false;
          this.sendUserInput();
          this.audioButtonColor = "success";
          console.log("in get of userinput");
        }
        return this.$store.getters.getUserInput;
      },
      set: function(userInput) {
        this.$store.commit("setUserInput", userInput);
      }
    }
  },
  methods: {
    stopAudioCapture() {
      this.$store.commit("hideListening");
      this.$store.dispatch("stopAudioCapture");
      this.audioButtonColor = "success";
    },
    updateInputBox(userInput) {
      this.$store.commit("setUserInput", userInput);
      this.$refs.userInput.focus();
    },
    sendUserInput() {
      if (this.$store.getters.getUserInput) {
        this.$store.dispatch("sendUserInput");
      }
    },
    captureAudio() {
      if (
        window.hasOwnProperty("webkitSpeechRecognition") &&
        window.hasOwnProperty("speechSynthesis")
      ) {
        this.audioButtonColor = "error";
        this.audioButtonClasses = "white--text";
        this.$store.commit("showListening");
        this.$store.dispatch("captureAudio");
      }
    }
  }
};
</script>

<style scoped>
</style>