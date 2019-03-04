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
        small
        color="primary"
        dark
        v-on:click="newSession"
      >New Session<v-icon
          right
          dark
        >refresh</v-icon>
      </v-btn>
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
            xs2.5
          >
            <v-card
              elevation="0"
              color="white"
              class="black--text"
            >
              <v-layout row>
                <v-flex xs12>
                  <v-img
                    :src="require('../assets/bulb.png')"
                    contain
                    style="margin:3px"
                    :class="{ 'rainbow-bulb' : (bulb.active && bulb.color === 'rainbow') }"
                    :style="{ 'background': getBulbColor(bulb) }"
                  ></v-img>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container>
        <v-layout
          align-start
          justify-start
          row
        >
          <v-flex xs9>
            <v-text-field
              clearable
              v-model="userInput"
              @keyup.enter.native="sendUserInput"
              label="Control the Lights. Ask me questions."
            ></v-text-field>
          </v-flex>
          <v-flex>
            <v-btn @click="sendUserInput">Send</v-btn>
          </v-flex>
        </v-layout>
      </v-container>

    </v-card>
    <Listening
      v-bind:value="listening"
      message="Listening"
    ></Listening>

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
          this.$store.commit("userInputNotReadyForSending");
          this.sendUserInput();
        }
        return this.$store.getters.getUserInput;
      },
      set: function(userInput) {
        this.$store.commit("setUserInput", userInput);
      }
    }
  },
  methods: {
    newSession() {
      this.$store.dispatch("endSession");
    },
    getBulbColor(bulb) {
      let finalColor = "";
      if (bulb.active && bulb.color !== "" && bulb.color !== "rainbow") {
        finalColor = bulb.color;
      } else if (bulb.active && bulb.color === "") {
        finalColor = "yellow";
      } else {
        finalColor = "";
      }
      return finalColor;
    },
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
.rainbow-bulb {
  height: 100%;
  width: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: relative;
  background: linear-gradient(
    124deg,
    #ff2400,
    #e81d1d,
    #e8b71d,
    #e3e81d,
    #1de840,
    #1ddde8,
    #2b1de8,
    #dd00f3,
    #dd00f3
  );
  background-size: 1000% 100%;

  -webkit-animation: rainbow 2s ease infinite;
  -z-animation: rainbow 2s ease infinite;
  -o-animation: rainbow 2s ease infinite;
  animation: rainbow 2s ease infinite;
}

@-webkit-keyframes rainbow {
  0% {
    background-position: 0% 82%;
  }
  50% {
    background-position: 100% 19%;
  }
  100% {
    background-position: 0% 82%;
  }
}
@-moz-keyframes rainbow {
  0% {
    background-position: 0% 82%;
  }
  50% {
    background-position: 100% 19%;
  }
  100% {
    background-position: 0% 82%;
  }
}
@-o-keyframes rainbow {
  0% {
    background-position: 0% 82%;
  }
  50% {
    background-position: 100% 19%;
  }
  100% {
    background-position: 0% 82%;
  }
}
@keyframes rainbow {
  0% {
    background-position: 0% 82%;
  }
  50% {
    background-position: 100% 19%;
  }
  100% {
    background-position: 0% 82%;
  }
}
</style>