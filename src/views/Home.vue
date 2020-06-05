<template>
  <div class="home">
    <p>this is the home page</p>
        <v-layout row wrap class="ma-4">
      <v-flex xs12 sm6 md4 lg3 v-for="device in devices" :key="device.id">
        <v-card 
          class="text-center ma-6"
          color="grey lighten-5"
        >
          <v-responsive class="pt-4">
            <v-avatar color=cyan size="100">
            </v-avatar>
            <v-card-text>
              <div class="heading font-weight-bold grey--text">{{device.name}}</div>
            </v-card-text>
            <v-card-text>
              <div 
                class="static"
                :class="{'green--text': device.status == 'connected', 'grey--text': device.status == 'not connected'}"
              >
                {{device.status}}</div>
              <!-- <v-btn @click="refresh_status(device.session_id)">refresh status</v-btn> -->
            </v-card-text>
            <router-link :to="{name:'About'}">
              <span v-on:click="set_device(device.session_id)">MONITOR DEVICE</span>
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
    ...mapMutations(['SELECT_DEVICE','SET_JOINED']),
    ...mapActions(['poll_devices']),

    set_device(session_id){
      this.SELECT_DEVICE(session_id);
      this.SET_JOINED(true);
    },
  },

  created(){
    this.poll_devices();
  },

  beforeDestroy(){
    //
  }
}
</script>
