// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Im5OS1g4Q0pNIiwiaWF0IjoxNTgyODk1OTM2MzM0LCJleHAiOjE1ODI5ODIzMzYsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkQ2hhdCIsImRhdGEiOnsidXNlcklkIjoiY1VRQmFocGsiLCJmaXJzdE5hbWUiOiJEaGFuYW5qYXkiLCJsYXN0TmFtZSI6IlNoYXJtYSIsImVtYWlsIjoiZGhhbmFuamF5MzE5MkBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk4MzAxNDk2Njl9fQ.0q5c2t8cuKbBa8R5r2IB3L8k2XjpMY6pOfxM3GpCt6o";
const userId = "cUQBahpk";

let chatMessage = {
    createdOn: Date.now(),
    receiverId: 'm8cdAVA8',//putting user1's id here 
    receiverName: "Deejay Sharma",
    senderId: userId,
    senderName: "Dhananjay Sharma"
  }

let chatSocket = () => {

    socket.on('verifyUser', (data) => {

        console.log("socket trying to verify user");

        socket.emit("set-user", authToken);
    });

    socket.on(userId, (data) => {

        console.log("you received a message from " + data.senderName)
        console.log(data.message)
    });

    socket.on("online-user-list", (data) => {
       
        console.log("Online user list is updated")
        console.log(data)
    });


    $("#send").on('click', function (){
        let messageText = $("#messageToSend").val()
        chatMessage.message = messageText;
        socket.emit("chat-msg", chatMessage)
    })

    $("#messageToSend").on('keypress', function(){

        socket.emit("typing", "Dhananjay Sharma")
    })

    socket.on("typing", (data) => {

        console.log(data+" is typing")
        
        
    });

}// end chat socket function

chatSocket();