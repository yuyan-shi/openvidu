<template>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">OPENVIDU SHOULD HAVE VUE TUTORIAL</div>
                        <input type="text" v-model="session_name" required>
                </div>
            </div>
        </div>
<button type="button" class="btn btn-primary" @click="getId">Test REST API (return session ID)</button>
<button type="button" class="btn btn-primary" @click="getToken">Test REST API (return session token)</button>
<p>session name: {{session_name}}</p>
<p>session ID: {{id_output}}</p>
<p>session Token: {{token_output}}</p>
    </div>
</template>

     
<script>
import axios from 'axios';
    export default {
        name: 'HelloWorld',
        mounted() {
            console.log('Component mounted.')
        },

        data() {
            return {
                OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
                OPENVIDU_SERVER_SECRET: "MY_SECRET",
                id_output:"",
                session_name:"session_A",
                token_output:"",
            };
        },
        methods: {
            getId: function(session_name){
                return this.createSession(session_name);
            },

            getToken: function(session_name){
                return this.createToken(session_name);
            },

            createSession: function(session_name) {
                console.log(session_name)
                return new Promise((resolve,reject) => {  
                let currentObj = this;
                axios({
                    method:'post', 
                    url: this.OPENVIDU_SERVER_URL + "/api/sessions",
                    data: JSON.stringify({ customSessionId: "session_bbas"}),
                    headers: {
                        "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                        "Content-Type": "application/json"
                    },
                })
                .then(function (response) {
                    currentObj.id_output = response.data.id;
                    console.log('CREATE SESION', response);
                    resolve(response.data.id)
                })
                .catch(function (response) {
                    var error = Object.assign({}, response);
                    currentObj.output = error.response;  // for debugging
                    console.warn(error.response);

                    if (error.response.status === 409) {
                        resolve(session_name);
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

            // createSession: function(sessionId) {
            //     return new Promise((resolve) => {
            //     var data = JSON.stringify({ customSessionId: sessionId });
            //     axios({
            //         method:'post',
            //         url: 'https://localhost:4443/api/sessions', 
            //         body: data, 
            //     // auth: {
            //     //     username: "OPENVIDUAPP",
            //     //     password: "MY_SECRET",
            //     // },
            //     headers: {
            //         Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
            //         'Content-Type': 'application/json',
            //     },
            //     })
            //     .then((response) => {
            //         console.log('CREATE SESION', response);
            //         resolve(response.data.id);
            //     })
            //     .catch((response) => {
            //         var error = Object.assign({}, response);
            //         if (response.status === 409) {
            //         resolve(sessionId);
            //         } else {
            //             var error_string = JSON.stringify(error);
            //             console.log(error_string);
            //             console.warn(
            //             'No connection to OpenVidu Server. This may be a certificate error at ' +
            //             this.OPENVIDU_SERVER_URL,
            //             );
            //             if (
            //                 window.confirm(
            //                     'No connection to OpenVidu Server. This may be a certificate error at "' +
            //                     this.OPENVIDU_SERVER_URL +
            //                     '"\n\nClick OK to navigate and accept it. ' +
            //                     'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
            //                     this.OPENVIDU_SERVER_URL +
            //                     '"',
            //                 )
            //             ) {
            //             window.location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
            //             }
            //         }
            //     });
            //     });
            // },

            // createSession(sessionId) {
            //     return new Promise((resolve, reject) => {
                
            //     let currentObj = this;
            //     this.axios({
            //         method:'post', 
            //         url: this.OPENVIDU_SERVER_URL + "/api/sessions",
            //         data: JSON.stringify({ customSessionId: sessionId }),
            //         //data: {"customSessionId": "sessionId" }, 
            //         // auth: {
            //         //         username: "OPENVIDUAPP",
            //         //         password: "MY_SECRET",
            //         //     },
            //         headers: {
            //             "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
            //             "Content-Type": "application/json"
            //         },
                     
            //     })
            //     .then(function (response) {
            //         currentObj.output = response.data.id; // for debugging
            //         console.log('CREATE SESION', response);
            //         resolve(response.data.id)
            //     })
            //     .catch(function (response) {
                    
            //         var error = Object.assign({}, response);
            //         currentObj.output = error.response;  // for debugging
                     
            //         if (error.response.status === 409) {
            //             resolve(sessionId); //sessionId
            //         } else {
            //             console.log(error);
            //             console.warn(
            //                 'No connection to OpenVidu Server. This may be a certificate error at ' +
            //                 this.OPENVIDU_SERVER_URL,
            //             );
            //             if (
            //                 window.confirm(
            //                     'No connection to OpenVidu Server. This may be a certificate error at "' +
            //                     this.OPENVIDU_SERVER_URL +
            //                     '"\n\nClick OK to navigate and accept it. ' +
            //                     'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
            //                     this.OPENVIDU_SERVER_URL +
            //                     '"',
            //                 )
            //             ) {
            //                 window.location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
            //             }
            //         }
            //         reject(error)  //not sure of the purpose
            //     });
            // });
            // },

            createToken: function(session_name) {
                return new Promise((resolve, reject) => {    
                let currentObj = this;
                axios({
                    method:'post', 
                    url: this.OPENVIDU_SERVER_URL + "/api/tokens",
                    data: JSON.stringify({ session: session_name }),
                    headers: {
                        "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                        "Content-Type": "application/json"
                    },  
                })
                .then(function (response) {
                    currentObj.token_output = response.data.id;
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


