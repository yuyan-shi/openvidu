import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedDevice:undefined, 
    joined: false,
    devices: [
      {
        id: 1, 
        title:"Home Camera Series 1",
        session_id:"camera1",
        color:"indigo lighten-2"
      },
      {
        id: 2,
        title:"Home Camera Series 2",
        session_id:"camera2",
        color:"teal ligthen-5"
      }
    ]
  },
  mutations: {
    set_device(state,device){
      state.selectedDevice = device;
    },
    set_joined(state,bol){
      state.joined = bol;
    }
  },
  actions: {
  },
  modules: {
  }
})
