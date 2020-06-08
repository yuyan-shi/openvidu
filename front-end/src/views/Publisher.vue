<template>
  <v-container fluid>
    <p>this is a sample camera publisher</p>
    <v-row align="center">
      <v-col class="d-flex" cols="12" sm="6">
          <v-select
            v-model="selected"
            :items="devices"
            item-text="device_name"
            item-value="Session_id"
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
      <br>
        <div >
            <div id ="publisher" class="publisher"></div>
      </div>
    </div>
    </v-container>

</template>

<script>
import {mapState, mapMutations, mapActions} from 'vuex';
import {OpenVidu} from 'openvidu-browser';
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
    ...mapState(['joined', 'selectedDevice', 'devices']),
  },

  mounted:function(){
    if(this.joined&&this.selectedDevice){
      console.log('joined and sleectedDevice are toggled');
      this.joinSession();
    }
  },

  beforeDestroy(){
    if(session){
        this.leaveSession();
    }
  },

  created(){
    this.poll_devices();
  },

  methods:{
    ...mapMutations(['SELECT_DEVICE','SET_JOINED']),
    ...mapActions(['poll_devices','get_token']),

    joinSession: function(){
      this.SET_JOINED(true);
      console.log("in joinSession")
      OV = new OpenVidu();
      session = OV.initSession();

      this.get_token(this.selectedDevice)
      .then(token => {
        console.log("token:" + token)
        session.connect(token)
      })
      .then(() => {
        var publisher = OV.initPublisher("publisher");
        session.publish(publisher);
      })
      .catch(error => {
        console.warn("There was an error connecting to the session:", error.code, error.message);
      });
    },

    leaveSession: function() {
      session.disconnect();
      this.SET_JOINED(false);
    },

    changed_selection:function(){
      if(session){
        this.leaveSession();
      }
      this.SELECT_DEVICE(this.selected);
    },
  }
}
</script>
