<template>
  <v-container fluid>
    <v-row align="center">
      <v-col class="d-flex" cols="12" sm="6">
          <v-select
            v-if="devices"
            v-model="selected"
            :items="devices"
            item-text="title"
            item-value="session_id"
            label="Select devices"
            v-on:change="changed_selection"
          >
          </v-select>
      </v-col>
      <v-col class="d-flex" cols="6" sm="3">
        <v-btn v-if="selectedDevice&&!joined" @click="joinSession">Join session</v-btn>
      </v-col>
    </v-row>
    <div id="session" v-if="joined">
      <h2>Viewing session: {{selectedDevice}}</h2>
      <v-btn @click="leaveSession">LEAVE SESSION</v-btn>
        <div >
            <div id ="publisher" class="publisher" ><h3>YOU</h3></div>
            <div id ="subscriber" class="subscriber"><h3>OTHERS</h3></div>
      </div>
    </div>
    </v-container>

</template>

<script>
import {OpenVidu} from 'openvidu-browser';
import axios from 'axios';
var OV;
var session;
export default {
  name:'about',
  data(){
    return{
      selected:'',
      OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
      OPENVIDU_SERVER_SECRET: "MY_SECRET",
    }
  },
  computed:{
    joined(){
      return this.$store.state.joined;
    },
    selectedDevice(){
      return this.$store.state.selectedDevice;
    },
    devices(){
      return this.$store.state.devices;
    }
  },
  mounted:function(){
    if(this.joined&&this.selectedDevice){
      console.log('joined and sleectedDevice are toggled');
      this.joinSession();
    }
  },
  methods:{
    joinSession: function(){
      this.$store.commit('set_joined', true);
      console.log("in joinSession")
      OV = new OpenVidu();
      session = OV.initSession();

      this.getToken(this.selectedDevice).then(token => {
      console.warn("after getToken")
      session.connect(token)
      .then(() => {
          console.warn("In session.connect.then")
          // var publisher = OV.initPublisher("publisher", { resolution: '320x240', frameRate: 15 });
          var publisher = OV.initPublisher("publisher");
          session.publish(publisher);
          })
          .catch(error => {
          console.warn("There was an error connecting to the session:", error.code, error.message);
          });
      });
    },

    leaveSession: function() {
      session.disconnect();
      this.$store.commit('set_joined', false);
    },

    changed_selection:function(){
      if(session){
        this.leaveSession();
      }
      this.$store.commit('set_device',this.selected);
      console.log('selectedDevice: ' + this.selectedDevice);
    },

    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
     *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
     *   3) The token must be consumed in Session.connect() method
     */

        getToken(mySessionId) {
            return this.createSession(mySessionId).then(() => this.createToken(this.selectedDevice));
        },

        createSession: function(session_id) {
            console.log(session_id)
            return new Promise((resolve,reject) => {  
            let currentObj = this;
            axios({
                method:'post', 
                url: this.OPENVIDU_SERVER_URL + "/api/sessions",
                data: JSON.stringify({ customSessionId: session_id}),
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                    "Content-Type": "application/json"
                },
            })
            .then(function (response) {
                currentObj.id_output = response.data.id;
                console.log('CREATE SESION', response);
                resolve(response.data.id);
            })
            .catch(function (response) {
                var error = Object.assign({}, response);
                currentObj.output = error.response;  // for debugging
                console.warn(error.response);

                if (error.response.status === 409) {
                    currentObj.id_output = session_id;
                    resolve(session_id);
                } else {
                    var error_string = JSON.stringify(error);
                    console.log(error_string);
                    console.warn(
                    'No connection to OpenVidu Server. This may be a certificate error at ' +
                    this.OPENVIDU_SERVER_URL,
                );
                    if (
                        window.confirm(
                        'No connection to OpenVidu Server. This may be a certificate error at "' +
                        this.OPENVIDU_SERVER_URL +
                        '"\n\nClick OK to navigate and accept it. ' +
                        'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                        this.OPENVIDU_SERVER_URL +
                        '"',
                    )
                    ) {
                        window.location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
                    }
                }
                reject(error);
            });
            });
        },

        createToken: function(session_id) {
            return new Promise((resolve, reject) => {    
            let currentObj = this;
            console.log("session_id: " + session_id)
            axios({
                method:'post', 
                url: this.OPENVIDU_SERVER_URL + "/api/tokens",
                data: JSON.stringify({ session: session_id }),
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                    "Content-Type": "application/json"
                },  
            })
            .then(function (response) {
                currentObj.token_output = response.data.token;
                resolve(response.data.id)
            })
            .catch(function (error) {
                console.warn("error in createToken")
                currentObj.token_output = error;
                reject(error)
            });
            });
        },
        }
}
</script>
