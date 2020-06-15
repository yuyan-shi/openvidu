<template>
  <v-container fluid >
    <!-- <v-row align="center">
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
        <v-btn v-if="selected_device&&!joined" @click="join_session">Join session</v-btn>
      </v-col>
    </v-row> -->

  <v-row>
    <v-col cols = "12">
      <h2>Viewing session: {{selected_device}}</h2>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols = "12">
      <v-btn small depressed to="/" @click="before_unload">BACK TO HOME</v-btn>
      <v-btn small depressed color="grey lighten-2" v-if="joined&&!loading" @click="unpublish_camera()">Disconnect device</v-btn>
    </v-col>
  </v-row>


  <v-row>
    <v-col cols = "12">

      <v-progress-circular
        v-if="loading"
        indeterminate
        color="blue-grey"
      ></v-progress-circular>

      <div id ="subscriber" class="subscriber">
        <v-card v-if="selected_status == 'not connected'" 
        color="grey darken-3" dark 
        height="200px" max-width="500"
        >
          <v-card-title class="layout justify-center text-center">
            This device is not available.<br/>
            Please connect your device to view stream.
          </v-card-title>
          <v-card-actions class="layout justify-center">
            <v-btn @click="connect_device()">Connect to device</v-btn>
          </v-card-actions>  
        </v-card>

      </div>

    </v-col>
  </v-row>

  <v-row>
    <v-col cols = "12" class="pa-2">
      <v-btn outlined color="red" small v-if="selected_status == 'connected'" @click="start_record">
        <v-icon left>mdi-record</v-icon>
        Start Recording
      </v-btn>
      <v-btn outlined color="secondary" small v-if="recording" @click="stop_record">
        Stop Recording
      </v-btn>
      <v-btn small dark depressed color="indigo" v-if="!show_table" @click="retrieve_recording">
        View past recordings
      </v-btn>
      <v-btn small dark depressed color="indigo" v-if="show_table" @click="show_table = false">
        Hide table
      </v-btn>

      <p>{{status_msg}}</p>

    </v-col>
  </v-row>

  <v-row>
    <v-data-table 
      v-if="recording_list && show_table" 
      loading-text="Loading... Please wait"
      :headers="headers"
      :items="recording_list"
      :items-per-page="5"
      class="elevation-1"
      >
      <template v-slot:item.open_url="{ item }">
        <v-btn text small @click="video_tab(item.url)"
          :class="{
            'primary--text': item.status == 'ready', 
            'grey--text': item.status != 'ready',
            }"
        >{{item.status}}</v-btn>
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
  </v-row>

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
      loading:false,
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
        { text: 'Duration', value: 'duration' },
        { text: 'Size', value: 'size' },
        { text: 'View video', value: 'open_url', sortable: false },
        { text: 'Delete', value: 'actions', sortable: false  },
      ],
      recording_list: undefined,
      view_video: "VIEW VIDEO"
    }
  },

  computed:{
    ...mapState(['joined','selected_device', 'selected_status']),
  },
  beforeMount(){
    window.addEventListener('beforeunload', this.before_unload) 
  },

  mounted:function(){
    if(this.selected_device){
      console.log('joined and sleectedDevice are toggled');
      this.join_session();
    }
  },

  created(){
    // setInterval(() => {this.POLL_DEVICES()},2000);
    // window.addEventListener('beforeunload', this.before_unload()) 
  },

  methods:{
    ...mapMutations(['SELECT_DEVICE', 'SET_JOINED']),
    ...mapActions(['POLL_DEVICES', 'GET_TOKEN', 'DISCONNECT', 
    'START_RECORD', 'STOP_RECORD', 'DELETE_RECORDING', 
    'RETRIEVE_RECORDING', 'PUBLISH_CAMERA']),

    /*
    Stop polling device list at intervals and call leave_session
    */
    before_unload(){
      console.log('in before_unload');
      clearInterval(this.POLL_DEVICES());
      if(session){
        this.leave_session();
      }
    },

    /*
    Join the device session by 
    1)establishing a web socket connection to openvidu
    2)API call to back-end to subscribe to the session
    */
    join_session: function(){
      this.SET_JOINED(true);
      this.loading = true;
      console.log("in join_session")
      OV = new OpenVidu();
      session = OV.initSession();

      session.on("streamCreated", function (event) {
        session.subscribe(event.stream, "subscriber");
      });

      let device = this.selected_device;
      let role = "SUBSCRIBER"
      this.GET_TOKEN({device,role})
      .then(token => {
        this.token = token;
        console.log('token:' + token);
        session.connect(token);
      })
      .then(() =>{
        this.loading = false;
      })
      .catch(error => {
      console.warn("There was an error connecting to the session:", error.code, error.message);
      });
    },

    /*
    Leave the device session by 
    1)breaking the web socket connection to openvidu
    2)API call to back-end to stop subscribing to the session
    */
    leave_session: function() {
      let device = this.selected_device;
      let token = this.token;

      if(this.recording){
        this.stop_record(this.recording_id);
      }
      console.log('in leave_session with data: ' + device + ' ' + token)
      this.DISCONNECT({device,token}).then(() => {
        console.log('DISCONNECT SUCCESS')
        this.SET_JOINED(false);
      }).catch(error =>{
        console.warn(error);
      });
      session.disconnect();
      this.SELECT_DEVICE(undefined);
    },

    /*Uncomment this when v-select drop down menu is used*/
    // changed_selection:function(){
    //   if(session){
    //     this.leave_session();
    //   }
    //   this.SELECT_DEVICE(this.selected);
    // },

    publish_camera:function(){
      let id = this.selected_device;
      let rtspUri = "rtsp://b1.dnsdojo.com:1935/live/sys3.stream";
      this.PUBLISH_CAMERA({id,rtspUri})
      .then(() => {

      })
      .catch(error => {
        console.warn(error)
      })
    },

    unpublish_camera:function(){
      
    },

    /*
    API call to back-end to record the current session.
    If there are no active publishers, recording will have a black screen.
    */
    start_record:function(){
      if(session){
        console.log('starting recording for session: ' +this.selected_device)
        this.START_RECORD(this.selected_device).then(response => {
          if(response[1] == 'started'){
            this.recording = true;
            this.recording_id = response[0];
            this.status_msg = 'Recording started at id: ' + this.recording_id;
          }
          else this.status_msg = 'We encouterd an error when starting the recording'
        })
        .catch(error => {
          console.warn("There was an error recording the session:", error.message);
        })
      }
      else console.warn('Unable to start session as session does not exist')
    },

    /*
    API call to stop the current recording.
    There is a time lag between the time this function is activated and the time the recording is stopped.
    */
    stop_record:function(){
      this.status_msg = "Stopping recording, please wait..."
      let device = this.selected_device;
      let id = this.recording_id;
      this.STOP_RECORD({device,id}).then(response => {
          if(response[1] == 'ready'){
            this.recording = false;
            this.recording_id = response[0];
            this.status_msg = 'Your recording is successfully saved under id: ' + this.recording_id;
          }
          else this.status_msg = 'We encouterd an error when stoping the recording'
        })
        .catch(error => {
          console.warn("There was an error stoping this recording", error.code, error.message);
        })
    },

    /*
    Retrieve previous recordings that are made with this device.
    This function also allows a user to access functions to delete and view recordings.
    */   
    retrieve_recording:function(){
      this.show_table = true
      this.RETRIEVE_RECORDING(this.selected_device).then(response => {
        this.recording_list = response
      })
      .catch(error => {
        this.status_msg = error + '. There are no recordings found for this session.'
      })
    },

    /*
    Delete a specific recording with the specified recording_id
    */
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

    /*
    Opens the specified url in a new tab.
    Users can preview the video and download the video in the new tab.
    */
    video_tab:function(video_url){
      if(video_url){
        console.log('video_url')
        window.open(video_url);
      }
    }

  }
}
</script>
