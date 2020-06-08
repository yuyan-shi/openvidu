import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    //split this file into modules are include them here if there are too many functions
  },
  state: {
    backend_url: "https://localhost:5000/api-sessions",
    // backend_url: "https://165.22.99.104:5000/api-sessions",
    selectedDevice:undefined, 
    joined: false,
    devices: undefined,
    token: undefined
  },
  
  mutations: {
    UPDATE_DEVICES(state,arr){
      state.devices = arr;
    },
    SELECT_DEVICE(state,device){
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
    },
    TOKEN_UPDATE(state,token){
      state.token = token;
    }
  },

  actions: {
    poll_devices(context){
      setInterval(() => {
        axios({
          method:'get', 
          url: context.state.backend_url + "/obtain-device-list",
          headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }).then(function(response){
          context.commit('UPDATE_DEVICES',Object.values(response.data));
        })
        .catch(function(error){
          console.warn(error);
        })
      },2000)
    },

    get_token(context,session){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/get-token",
          data: JSON.stringify({session_id:session}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          console.log('store returns token: ' + response.data.token)
          resolve(response.data.token);
        })
        .catch(error => {
          reject(error)
        })
      })
    },
    // check_status(context,session_id) {
    //   axios({
    //       method:'get', 
    //       url: context.state.OPENVIDU_SERVER_URL + "/api/sessions/" + session_id,
    //       headers: {
    //           "Authorization": "Basic " + btoa("OPENVIDUAPP:" + context.state.OPENVIDU_SERVER_SECRET),
    //           "Content-Type": "application/json",
    //           'Access-Control-Allow-Origin': '*'
    //       },  
    //   })
    //   .then(function (response) {
    //       var elements_count = response.data.connections.numberOfElements;
    //       var i;
    //       for(i=0; i<elements_count; i++) {
    //         var obj = response.data.connections.content[i];
    //         if(obj.role == 'PUBLISHER'){
    //           console.log('supposed to set status to connected')
    //           context.commit('STATUS_CONNECT',session_id);
    //         }
    //       }
    //   })
    //   .catch(function () {
    //       context.commit('STATUS_DISCONNECT',session_id);
    //   });
    // },
  },
})

export default store;
