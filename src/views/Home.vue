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
            <v-avatar :color="device.color" size="100">
            </v-avatar>
            <v-card-text>
              <div class="heading font-weight-bold grey--text">{{device.title}}</div>
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
export default {
  name: 'Home',
  computed:{
    joined(){
      return this.$store.state.joined;
    },
    selectedDevice(){
      return this.$store.state.selectedDevice;
    },
    devices(){
      return this.$store.state.devices;
    }
  },
  methods:{
    set_device(session_id){
      this.$store.commit('set_device',session_id);
      this.$store.commit('set_joined', true);
    }
  }
}
</script>
