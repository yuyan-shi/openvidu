<template>
  <v-container fluid>
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

    <div id="session" v-if="joined" pa-2>
      <h2>Viewing session: {{selectedDevice}}</h2>
      <v-btn @click="leaveSession">LEAVE SESSION</v-btn>
      <br>
      <div id ="subscriber" class="subscriber"></div>

      <v-btn outlined color="red" small v-if="!recording" @click="start_record">
        <v-icon left>mdi-record</v-icon>
        Start Recording
      </v-btn>
      <v-btn outlined color="secondary" small v-if="recording" @click="stop_record">Stop Recording</v-btn>
      <v-btn small dark color="indigo" v-if="!show_table" @click="retrieve_recording">View past recordings</v-btn>
      <v-btn small dark color="indigo" v-if="show_table" @click="show_table = false">Hide table</v-btn>

      <p>{{status_msg}}</p>

      <v-data-table 
        v-if="recording_list && show_table" 
        loading-text="Loading... Please wait"
        :headers="headers"
        :items="recording_list"
        :items-per-page="5"
        class="elevation-1"
      >
          <template v-slot:item.open_url="{ item }">
            <v-btn text small color="primary" @click="video_tab(item.url)">{{view_video}}</v-btn>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              @click="delete_recording(item.id)"
            >
              mdi-delete
            </v-icon>
          </template>

      </v-data-table>
    </div>
    </v-container>

</template>

<script>
import {mapState, mapMutations, mapActions} from 'vuex';
import {OpenVidu} from 'openvidu-browser';
// import axios from 'axios';
var OV;
var session;
export default {
  name:'about',
  data(){
    return{
      selected:'',
      token:undefined,
      recording: false,
      recording_id: undefined,
      status_msg: undefined,
      show_table: false,
      headers: [
        {
          text: 'ID',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Timestamp', value: 'timestamp' },
        { text: 'View video', value: 'open_url', sortable: false },
        { text: 'Delete', value: 'actions', sortable: false  },
      ],
      recording_list: undefined,
      view_video: "VIEW VIDEO"
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

  created(){
    setInterval(() => {
      this.POLL_DEVICES();
    },2000)
  },

  beforeDestroy(){
    clearInterval(this.POLL_DEVICES());
    this.leaveSession();
  },

  methods:{
    ...mapMutations(['SELECT_DEVICE', 'SET_JOINED']),
    ...mapActions(['POLL_DEVICES', 'GET_TOKEN', 'DISCONNECT', 
    'START_RECORD', 'STOP_RECORD', 'DELETE_RECORDING', 
    'RETRIEVE_RECORDING']),

    joinSession: function(){
      this.SET_JOINED(true);
      console.log("in joinSession")
      OV = new OpenVidu();
      session = OV.initSession();

      session.on("streamCreated", function (event) {
        session.subscribe(event.stream, "subscriber");
      });

      this.GET_TOKEN(this.selectedDevice)
      .then(token => {
        this.token = token;
        session.connect(token);
      })
      .catch(error => {
      console.warn("There was an error connecting to the session:", error.code, error.message);
      });
    },

    leaveSession: function() {
      let device = this.selectedDevice;
      let token = this.token;

      if(this.recording){
        this.stop_record(this.recording_id);
      }
      console.log('in leaveSession with data: ' + device + ' ' + token)
      this.DISCONNECT({device,token}).then(() => {
        console.log('DISCONNECT SUCCESS')
        this.SET_JOINED(false);
      }).catch(error =>{
        console.warn(error);
      });
      session.disconnect();
    },

    changed_selection:function(){
      if(session){
        this.leaveSession();
      }
      this.SELECT_DEVICE(this.selected);
    },

    start_record:function(){
      if(session){
        console.log('starting recording for session: ' +this.selectedDevice)
        this.START_RECORD(this.selectedDevice).then(response => {
          if(response[1] == 'started'){
            this.recording = true;
            this.recording_id = response[0];
            this.status_msg = 'Recording started at id: ' + this.recording_id;
          }
          else{
            this.status_msg = 'We encouterd an error when starting the recording'
          }
        })
        .catch(error => {
          console.warn("There was an error recording the session:", error.message);
        })
      }else{
        console.warn('Unable to start session as session does not exist')
      }
    },

    stop_record:function(){
      this.status_msg = "Stopping recording, please wait..."
      let device = this.selectedDevice;
      let id = this.recording_id;
      this.STOP_RECORD({device,id}).then(response => {
          if(response[1] == 'ready'){
            this.recording = false;
            this.recording_id = response[0];
            this.status_msg = 'Your recording is successfully saved under id: ' + this.recording_id;
          }
          else{
            this.status_msg = 'We encouterd an error when stoping the recording'
          }
        })
        .catch(error => {
          console.warn("There was an error stoping this recording", error.code, error.message);
        })
    },

    retrieve_recording:function(){
      this.show_table = true
      this.RETRIEVE_RECORDING(this.selectedDevice).then(response => {
        this.recording_list = response
      })
      .catch(error => {
        this.status_msg = error + ' There are no recordings found for this session'
      })
    },

    delete_recording:function(id){
      console.log('delete_recording, id: ' + id)
      this.DELETE_RECORDING(id).then(response => {
        this.status_msg = response;
        this.retrieve_recording();
      })
      .catch(error => {
        this.status_msg = error;
      })
    }, 

    video_tab:function(video_url){
      let url = "https://OPENVIDUAPP:MY_SECRET@" + video_url.substr(8);
      console.log('url')
      window.open(url);
    }

  }
}
</script>
