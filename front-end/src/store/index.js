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
    POLL_DEVICES(context){
      axios({
        method:'get', 
        url: context.state.backend_url + "/api-sessions/obtain-device-list",
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
    },

    GET_TOKEN(context,session){
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-sessions/get-token",
          data: JSON.stringify({session_id:session}),
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

    DISCONNECT(context,{session,token}){
      console.log(session,token)
      return new Promise((resolve,reject) => {
        axios({
          method:'post', 
          url: context.state.backend_url + "/api-sessions/remove-user",
          data: JSON.stringify({session_id:session, token:token}),
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log('removing session ' + session + ' failed');
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
      return new Promise((resolve,reject) => {
        axios({
        method:'get', 
        url: context.state.backend_url + "/api-recording/session/" + id,
        headers:{
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(function(response){
        var recordings= Object.values(response.data)
        // delete recordings.timestamp_raw
        resolve(recordings)
      })
      .catch(function(error){
        reject(error);
      })
      })
    },

  },  

})

export default store;
