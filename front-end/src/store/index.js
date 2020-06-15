import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    //split this file into modules are include them here if there are too many functions
  },
  state: {
    // backend_url: "https://localhost:5000",
    backend_url: "https://165.22.99.104:5000",
    selected_device:undefined,
    selected_status:undefined,
    joined: false,
    devices: undefined,
  },
  
  mutations: {
    UPDATE_DEVICES(state,arr){
      state.devices = arr;
    },
    SELECT_DEVICE(state,device){
      state.selected_device = device;
    },
    UPDATE_STATUS(state,status){
      state.selected_status = status;
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
    POLL_DEVICES(context){
      axios({
        method:'get', 
        url: context.state.backend_url + "/api-sessions/obtain-device-list",
        headers:{
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(function(response){
        let data = Object.values(response.data);
        context.commit('UPDATE_DEVICES',data);
        if(context.state.selected_device){
          var i;
          for(i=0; i <Object.keys(data).length; i++){
            context.commit('UPDATE_STATUS', data[i]["Status"]);
          }
        }
      })
      .catch(function(error){
        console.warn(error);
      })
    },

    GET_TOKEN(context,{device,role}){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-sessions/get-token",
          data: JSON.stringify({session_id:device, role:role}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response.data.token);
        })
        .catch(error => {
          reject(error)
        })
      })
    },

    DISCONNECT(context,{device,token}){
      console.log("in DISCONNECT: " + device + " " + token)
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-sessions/remove-user",
          data: JSON.stringify({session_id:device, token:token}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log('removing session ' + device + ' failed');
          reject(error);
        })
      })
    },

    START_RECORD(context,session){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-recording/start-record",
          data: JSON.stringify({session_id:session}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          var output = [response.data.id, response.data.status]
          resolve(output);
        })
        .catch(error => {
          console.log('start recording at ' + session + ' failed');
          reject(error);
        })
      })
    },

    STOP_RECORD(context,{session,id}){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-recording/stop-record",
          data: JSON.stringify({session_id:session, record_id:id}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          var output = [response.data.id, response.data.status]
          resolve(output);
        })
        .catch(error => {
          reject(error);
        })
      })
    },

    DELETE_RECORDING(context,id){
      return new Promise((resolve,reject) => {
        axios({
          method:'delete', 
          url: context.state.backend_url + "/api-recording/" + id,
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        })
      })
    },

    RETRIEVE_RECORDING(context, id){
      console.log('in RETRIEVE_RECORDING with: ' + id)
      return new Promise((resolve,reject) => {
        axios({
        method:'get', 
        url: context.state.backend_url + "/api-recording/session/" + id,
        headers:{
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(function(response){
        let data = response.data;
        console.log("data.length: " + Object.keys(data).length);
        let i;
        for(i=0; i <Object.keys(data).length; i++){
          var size_mb = (data[i]["size"]/1000000).toFixed(1)
          if(size_mb > 0){
            data[i]["size"] = size_mb + "MB"
          }else{
            data[i]["size"] = (data[i]["size"]/1000).toFixed(0) + "KB"
          }
          data[i]["duration"] = (data[i]["duration"]/60).toFixed(0).toString() + "min " + (data[i]["duration"]%60).toFixed(0).toString() + "s"
        }
        var recordings= Object.values(data)
        resolve(recordings)
      })
      .catch(function(error){
        reject(error);
      })
      })
    },

    PUBLISH_CAMERA(context, id,rtspUri){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-sessions/ip-camera-publisher",
          data: JSON.stringify({session_id:id, rtspUri:rtspUri}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      })
    },

    UNPUBLISH_RECORDING(context,{session,connection}){
      let connection = "ipc_IPCAM_rtsp_CMXP_127_0_1_1_footage2_mkv"
      return new Promise((resolve,reject) => {
        axios({
          method:'delete', 
          url: context.state.backend_url + "/api-recording/" + session + "/" + connection,
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        })
      })
    },

    // VIEW_RECORDING(context, url){
    //   // console.log('auth: ' + context.state.OPENVIDU_USER + context.state.OPENVIDU_SERVER_SECRET);
    //   return new Promise((resolve,reject) => {
    //     axios({
    //     method:'get', 
    //     url: url,
    //     headers:{
    //       "Authorization": "Basic " + btoa("OPENVIDUAPP:" + context.state.OPENVIDU_SERVER_SECRET),
    //       "Content-Type": "application/json",
    //       "Access-Control-Allow-Origin": "*"
    //     }
    //   }).then(function(response){
    //     resolve(response);
    //   })
    //   .catch(function(error){
    //     console.warn(error)
    //     reject(error);
    //   })
    //   })
    // },

  },
  
  getters:{
    
  }

})

export default store;
