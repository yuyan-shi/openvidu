<template>
  <div class="hello" >

    <div id="join" v-show="!joined">
        <h1>Join a video session</h1>
        <form>
            <label>Session:</label>
            <v-text-field type="text" v-model="sessionId" required></v-text-field>
            <v-btn @click="joinSession">Join Session</v-btn>
        </form>
    </div>

    <div id="session" v-show="joined">
        <h1 v-text="sessionId"></h1>
        <v-btn @click="leaveSession">LEAVE</v-btn>
        <div >
            <div id ="publisher" class="publisher" ><h3>YOU</h3></div>
            <div id ="subscriber" class="subscriber"><h3>OTHERS</h3></div>
    </div>
    </div>
 
    </div>
    

</template>

<script>
// import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber } from 'openvidu-browser';
import {OpenVidu} from 'openvidu-browser';
import axios from 'axios';
var OV;
var session;
export default {
    name: 'HelloWorld',
    data(){
    return{
        joined: false,
        sessionId: "camera1",
        token: undefined,
        // OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
        OPENVIDU_SERVER_SECRET: "MY_SECRET",
        // backend_url: "https://localhost:5000",
        backend_url: "https://165.22.99.104:5000",
    };
    },

    props: {
    msg: String
    },

    beforeDestroy(){
        this.leaveSession();
    },
    methods:{
        joinSession: function(){
            console.log("in joinSession")
            OV = new OpenVidu();
            session = OV.initSession();

            session.on("streamCreated", function (event) {
                session.subscribe(event.stream, "subscriber");
            });

            this.getToken(this.sessionId).then(token => {
            this.token = token
            console.log('joining with token: ' + this.token)
            console.warn("after getToken")
            session.connect(token)
            .then(() => {
                console.warn("In session.connect.then")
                this.joined = true;
                var publisher = OV.initPublisher("publisher", { resolution: '320x240', frameRate: 15 });
                session.publish(publisher);
            })
            .catch(error => {
                console.warn("There was an error connecting to the session:", error.code, error.message);
            });
            });
        },

        leaveSession: function() {
            session.disconnect();
            console.log('session_id: ' + this.sessionId + ' token: ' + this.token)
            this.disconnect(this.sessionId,this.token)
            .then(() => {
                console.log('left session')
                this.joined = false;
            })
            .catch(error => {
                console.warn(error);
            })
        },

        disconnect(device,token){
            console.log("in DISCONNECT: " + device + " " + token)
            return new Promise((resolve,reject) => {
                axios({
                method:'post', 
                url: this.backend_url + "/api-sessions/remove-user",
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

        getToken(session){
            return new Promise((resolve,reject) => {
                axios({
                method:'post', 
                url: this.backend_url + "/api-sessions/get-token",
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
                console.log('tried connecting to: ' + this.backend_url + "/get-token")
                console.log('error in getToken: ' + error)
                reject(error)
            })
            })
        },

        }
    }

</script>


