import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    //split this file into modules are include them here if there are too many functions
  },
  state: {
    OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
    OPENVIDU_SERVER_SECRET: "MY_SECRET",
    selectedDevice:undefined, 
    joined: false,
    devices: [
      {
        id: 1, 
        title:"Home Camera Series 1",
        session_id:"camera1",
        color:"indigo lighten-2",
        status:"not connected"
      },
      {
        id: 2,
        title:"Home Camera Series 2",
        session_id:"camera2",
        color:"teal ligthen-5",
        status:"not connected"
      }
    ]
  },
  mutations: {
    SET_DEVICE(state,device){
      state.selectedDevice = device;
    },
    SET_JOINED(state,bol){
      state.joined = bol;
    },
    STATUS_CONNECT(state,session_id){
      const device = state.devices.find(device => {
        return device.session_id == session_id
      })
      device.status = 'connected';
    },
    STATUS_DISCONNECT(state,session_id){
      const device = state.devices.find(device => {
        return device.session_id == session_id
      })
      device.status = 'not connected';
    }
  },
  actions: {
    check_status(context,session_id) {
      axios({
          method:'get', 
          url: context.state.OPENVIDU_SERVER_URL + "/api/sessions/" + session_id,
          headers: {
              "Authorization": "Basic " + btoa("OPENVIDUAPP:" + context.state.OPENVIDU_SERVER_SECRET),
              "Content-Type": "application/json",
              'Access-Control-Allow-Origin': '*'
          },  
      })
      .then(function (response) {
          var elements_count = response.data.connections.numberOfElements;
          var i;
          for(i=0; i<elements_count; i++) {
            var obj = response.data.connections.content[i];
            if(obj.role == 'PUBLISHER'){
              console.log('supposed to set status to connected')
              context.commit('STATUS_CONNECT',session_id);
            }
          }
      })
      .catch(function () {
          context.commit('STATUS_DISCONNECT',session_id);
      });
    },
  },
})

export default store;
