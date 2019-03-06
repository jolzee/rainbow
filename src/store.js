import Vue from "vue";
import Vuex from "vuex";
import VueJsonp from "vue-jsonp";
import Artyom from "artyom.js";
import URL from "url-parse";
import replaceString from "replace-string";
import stripHtml from "string-strip-html";
import TIE from "@artificialsolutions/tie-api-client";

import { ASR_CORRECTIONS, BULBS_BASE } from "./constants/constants";

Vue.use(VueJsonp, 10000);
Vue.use(Vuex);

let store;

let timeoutVar;
let TENEO_URL =
  "https://teneo5feature-demos.presales.artificial-solutions.com/projectrainbow/" + "?viewname=STANDARDJSONP";
let REQUEST_PARAMETERS = "";
let artyom = null;

if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
  artyom = new Artyom();
  artyom.ArtyomVoicesIdentifiers["en-GB"] = ["Google UK English Female", "Google UK English Male", "en-GB", "en_GB"];
  artyom.initialize({
    soundex: true,
    continuous: false,
    listen: false, // Start recognizing
    lang: "en-GB",
    debug: false
  });
}

store = new Vuex.Store({
  state: {
    requestParameters: "",
    listening: false,
    speakBackResponses: true,
    userInputReadyForSending: false,
    userInput: "",
    bulbs: BULBS_BASE,
    teneoUrl: TENEO_URL,
    stopAudioCapture: false
  },
  getters: {
    getUserInput() {
      return store.state.userInput;
    },
    bulbs() {
      return store.state.bulbs;
    }
  },
  mutations: {
    showListening(state) {
      state.listening = true;
    },
    hideListening(state) {
      state.listening = false;
    },
    userInputNotReadyForSending(state) {
      state.userInputReadyForSending = false;
    },
    setUserInput(state, userInput) {
      if (userInput) {
        //state.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
        state.userInput = userInput;
      }
    },
    speakBackResponses(state, useTTS) {
      state.speakBackResponses = useTTS;
    }
  },
  actions: {
    stopAudioCapture() {
      if (artyom.isSpeaking()) {
        // console.log("muted TTS!");
        artyom.shutUp();
      }
      if (artyom.isObeying()) {
        UserDictation.stop();
        store.state.stopAudioCapture = true;
        // console.log("stopped audio capture!");
      }
    },
    endSession() {
      return new Promise(resolve => {
        let fullUrl = new URL(store.state.teneoUrl);
        let endSessionUrl =
          fullUrl.protocol + "//" + fullUrl.host + fullUrl.pathname + "endsession?viewtype=STANDARDJSONP";

        store.state.bulbs = BULBS_BASE;
        store.state.resetSession = true;
        store.state.userInput = "";
        if (artyom && artyom.isSpeaking()) {
          // console.log("Artyom is speaking something. Let's shut it up");
          artyom.shutUp();
        }

        Vue.jsonp(endSessionUrl, {})
          .then(() => {
            console.log("Session Ended");
            resolve();
          })
          .catch(() => {
            console.log("Session Ended");
            resolve();
          });
      });
    },
    login() {
      // get the greeting message if we haven't done so for this session
      return new Promise((resolve, reject) => {
        Vue.jsonp(TENEO_URL + REQUEST_PARAMETERS, {
          command: "login"
          // userInput: ""
        })
          .then(json => {
            store.commit("hideChatLoading"); // about to show the greeting - hide the chat loading spinner
            // console.log(decodeURIComponent(json.responseData.answer))
            let hasExtraData = false;
            if (json.responseData.extraData.extensions || json.responseData.extraData.liveChat) {
              hasExtraData = true;
            }
            const response = {
              type: "reply",
              text: decodeURIComponent(json.responseData.answer).replace(/onclick="[^"]+"/g, 'class="sendInput"'),
              bodyText: "",
              teneoResponse: json.responseData,
              hasExtraData: hasExtraData
            };
            // sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(response))
            store.state.dialog.push(response); // push the getting message onto the dialog
            if (hasExtraData) {
              store.state.modalItem = response;
              store.state.showModal = true;
            }
            resolve();
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    // eslint-disable-next-line no-unused-vars
    sendUserInput(context, params = "") {
      // send user input to Teneo when a live chat has not begun
      if (artyom && artyom.isSpeaking()) {
        // console.log("Artyom is speaking something. Let's shut it up");
        artyom.shutUp();
      }

      // TIE.sendInput(store.state.teneoUrl, null, { text: store.state.userInput }).then(response => {
      //   console.log(response.output);
      //   return response;
      // });

      Vue.jsonp(store.state.teneoUrl + REQUEST_PARAMETERS, {
        userinput: store.state.userInput
      })
        .then(json => {
          const response = {
            userInput: store.state.userInput,
            teneoAnswer: decodeURIComponent(json.responseData.answer).replace(/onclick="[^"]+"/g, 'class="sendInput"'),
            teneoResponse: json.responseData
          };

          // const ttsText = store.getters.getTTSInput(json.responseData);

          let ttsText = stripHtml(response.teneoAnswer);
          // ttsText = "Yes Sir - Text to Speech Is Working";
          if (response.teneoResponse.extraData.tts) {
            ttsText = stripHtml(decodeURIComponent(response.teneoResponse.extraData.tts));
          }

          let bulbsJson = decodeURIComponent(response.teneoResponse.extraData.bulbs);

          if (bulbsJson) {
            console.log(bulbsJson);
            store.state.bulbs = JSON.parse(bulbsJson);
          } else {
            console.log("No Bulb Information in Response");
          }

          // check if this browser supports the Web Speech API
          if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
            if (artyom && store.state.speakBackResponses) {
              artyom.say(ttsText);
            }
          }

          // context.commit("updateChatWindowAndStorage", response);

          // added on request from Mark J - switch languages based on NER language detection
          let langInput = decodeURIComponent(response.teneoResponse.extraData.langinput);
          let langEngineUrl = decodeURIComponent(response.teneoResponse.extraData.langengineurl);

          if (langEngineUrl !== "undefined" && langInput !== "undefined") {
            store.state.teneoUrl = langEngineUrl + "?viewname=STANDARDJSONP";
            // console.log(store.state.teneoUrl);
            store.state.userInput = langInput;
            store.commit("showProgressBar");
            store
              .dispatch("sendUserInput")
              .then(console.log("Sent original lang input to new lang specific solution"))
              .catch(err => {
                console.err("Unable to send lang input to new lang specific solution", err.message);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    captureAudio(state) {
      if (UserDictation != null) {
        if (artyom.isSpeaking()) {
          // console.log("Artyom is speaking something. Let's shut it up");
          artyom.shutUp();
        }
        state.stopAudioCapture = false;
        UserDictation.start();
      }
    }
  }
});

// setup Artyom

let UserDictation = null;
if (artyom != null) {
  UserDictation = artyom.newDictation({
    soundex: true,
    continuous: false, // Enable continuous if HTTPS connection
    onResult: function(text) {
      clearTimeout(timeoutVar);
      // Do something with the text
      if (text) {
        //text = text.replace(/^\w/, c => c.toUpperCase());
        text = text.replace(/what's/gi, "what");
        store.state.userInput = text;
      }
      timeoutVar = setTimeout(function() {
        // console.log("timeout - aborting recognition");
        UserDictation.stop();
        if (text) {
          store.state.userInput = text; // final transcript from ASR
        }
      }, 800);
    },
    onStart: function() {},
    onEnd: function() {
      store.state.listening = false;

      if (store.state.stopAudioCapture) {
        store.state.userInput = "";
        store.state.stopAudioCapture = false;
        return;
      }
      // let's fix sany ASR transcription erros

      if (store.state.userInput) {
        console.log("About to apply ASR corrections: " + store.state.userInput);
        let fixedUserInput = store.state.userInput;
        // console.log("Final Transcription from ASR: " + store.state.userInput);
        ASR_CORRECTIONS.forEach(replacement => {
          let startingText = fixedUserInput;

          if (replacement[0].indexOf(".") > -1) {
            fixedUserInput = replaceString(
              fixedUserInput.toLowerCase(),
              replacement[0].toLowerCase(),
              replacement[1].toLowerCase()
            );
          } else {
            let search = replacement[0].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // escase any special characters
            var re = new RegExp("\\b" + search + "\\b", "gi");
            // fixedUserInput = fixedUserInput.toLowerCase().replace(re, replacement[1].toLowerCase());
            fixedUserInput = fixedUserInput.replace(re, replacement[1]);
          }

          // console.log(`Starting: ${startingText} | Ending: ${fixedUserInput}`);

          if (startingText.toLowerCase() !== fixedUserInput.toLowerCase()) {
            console.log("Made a change to ASR response: " + replacement[0] + " >> " + replacement[1]);
          }
        });

        if (store.state.userInput.toLowerCase() !== fixedUserInput.toLowerCase()) {
          store.state.userInput = fixedUserInput;
          console.log(`Final Transcription: ${fixedUserInput}`);
        }

        setTimeout(function() {
          // store.state.userInputReadyForSending = true;
          store.dispatch("sendUserInput");
        }, 100);
      }
    }
  });
}

window.sendVoiceInput = function(userInput) {
  // console.log(`In SendVoiceInput: ${userInput}`);
  //store.state.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
  store.state.userInput = userInput;
  store.state.userInputReadyForSending = true;
  store.state.listening = false;
};

export default store;
