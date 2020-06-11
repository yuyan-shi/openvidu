<template>
  <div class="home">
    <p>this is the home page</p>
        <v-layout row wrap class="ma-4">
      <v-flex xs12 sm6 md4 lg3 v-for="device in devices" :key="device.session_id">
        <v-card 
          class="text-center ma-6"
          color="grey lighten-5"
        >
          <v-responsive class="pt-4">
            <v-avatar color=cyan size="100">
            </v-avatar>
            <v-card-text>
              <div class="heading font-weight-bold grey--text">{{device.device_name}}</div>
            </v-card-text>
            <v-card-text>
              <div 
                class="static"
                :class="{'green--text': device.Status == 'connected', 'grey--text': device.Status == 'not connected'}"
              >
                {{device.Status}}</div>
              <!-- <v-btn @click="refresh_status(device.session_id)">refresh status</v-btn> -->
            </v-card-text>
            <router-link :to="{name:'Device', params:{name: device.device_name}}">
              <span v-on:click="set_device(device.Session_id)">MONITOR DEVICE</span>
            </router-link>
          </v-responsive>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import {mapState, mapMutations, mapActions} from 'vuex';
export default {
  name: 'Home',
  computed:{
    ...mapState(['joined', 'selectedDevice', 'devices']),
  },

  methods:{
    ...mapMutations(['SELECT_DEVICE','DEVICE_STATUS','SET_JOINED']),
    ...mapActions(['POLL_DEVICES']),

    set_device(id){
      this.SELECT_DEVICE(id);
      this.SET_JOINED(true);
    },
  },

  created(){
    setInterval(() => {this.POLL_DEVICES()},2000)
     window.addEventListener('beforeunload', clearInterval(this.POLL_DEVICES()));
  },

  beforeDestroy(){
    clearInterval(this.POLL_DEVICES())
  }
}
</script>
