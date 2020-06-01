<template>
  <div class="hello">

<div id="join" v-show="!joined">
        <h1>Join a video session</h1>
        <form @submit.prevent="joinSession">
            <p>
                <label>Session:</label>
                <input type="text" v-model="sessionId" required>
            </p>
            <p>
                <input type="submit" value="JOIN">
            </p>
        </form>
    </div>

  <div id="session" v-show="joined">
        <h1 v-text="sessionId"></h1>
        <input type="button" @click="leaveSession" value="LEAVE">
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
        // session: Session,
        sessionId: "sessionA",
        OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
        OPENVIDU_SERVER_SECRET: "MY_SECRET",
    };
    },

    props: {
    msg: String
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
            console.warn("after getToken")
            session.connect(token)
            .then(() => {
                console.warn("In session.connect.then")
                this.joined = true;
                var publisher = OV.initPublisher("publisher");
                session.publish(publisher);
                })
                .catch(error => {
                console.warn("There was an error connecting to the session:", error.code, error.message);
                });
            });
        },

        leaveSession: function() {
                session.disconnect();
                this.joined = false;
            },

    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
     *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
     *   3) The token must be consumed in Session.connect() method
     */

        getToken(mySessionId) {
            return this.createSession(mySessionId).then(() => this.createToken(this.sessionId));
        },

        createSession: function(session_id) {
            console.log(session_id)
            return new Promise((resolve,reject) => {  
            let currentObj = this;
            axios({
                method:'post', 
                url: this.OPENVIDU_SERVER_URL + "/api/sessions",
                data: JSON.stringify({ customSessionId: session_id}),
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                    "Content-Type": "application/json"
                },
            })
            .then(function (response) {
                currentObj.id_output = response.data.id;
                console.log('CREATE SESION', response);
                resolve(response.data.id);
            })
            .catch(function (response) {
                var error = Object.assign({}, response);
                currentObj.output = error.response;  // for debugging
                console.warn(error.response);

                if (error.response.status === 409) {
                    currentObj.id_output = session_id;
                    resolve(session_id);
                } else {
                    var error_string = JSON.stringify(error);
                    console.log(error_string);
                    console.warn(
                    'No connection to OpenVidu Server. This may be a certificate error at ' +
                    this.OPENVIDU_SERVER_URL,
                );
                    if (
                        window.confirm(
                        'No connection to OpenVidu Server. This may be a certificate error at "' +
                        this.OPENVIDU_SERVER_URL +
                        '"\n\nClick OK to navigate and accept it. ' +
                        'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                        this.OPENVIDU_SERVER_URL +
                        '"',
                    )
                    ) {
                        window.location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
                    }
                }
                reject(error);
            });
            });
        },

        createToken: function(session_id) {
            return new Promise((resolve, reject) => {    
            let currentObj = this;
            console.log("session_id: " + session_id)
            axios({
                method:'post', 
                url: this.OPENVIDU_SERVER_URL + "/api/tokens",
                data: JSON.stringify({ session: session_id }),
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                    "Content-Type": "application/json"
                },  
            })
            .then(function (response) {
                currentObj.token_output = response.data.token;
                resolve(response.data.id)
            })
            .catch(function (error) {
                console.warn("error in createToken")
                currentObj.token_output = error;
                reject(error)
            });
            });
        },
        }
    }

</script>


