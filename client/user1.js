// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkJlZ0Q5LW9tIiwiaWF0IjoxNTgyODk2MDc0ODE4LCJleHAiOjE1ODI5ODI0NzQsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkQ2hhdCIsImRhdGEiOnsidXNlcklkIjoibThjZEFWQTgiLCJmaXJzdE5hbWUiOiJEZWVqYXkiLCJsYXN0TmFtZSI6IlNoYXJtYSIsImVtYWlsIjoiZGhhbmFuamF5QGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6Nzg5MDQ1NjM3Nn19.XezwI7rxhcphy9RpBypYmCNuEbbM4p5h_zEB280wn9w";
const userId = "m8cdAVA8";

let chatMessage = {
    createdOn: Date.now(),
    receiverId: 'cUQBahpk',//putting user2's id here 
    receiverName: "Dhananjay Sharma",
    senderId: userId,
    senderName: "Deejay Sharma"
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

    socket.on("typing", (data) => {

        console.log(data+" is typing")
        
        
    });

    $("#send").on('click', function (){
        let messageText = $("#messageToSend").val()
        chatMessage.message = messageText;
        console.log("chat message "+chatMessage.message)
        socket.emit("chat-msg", chatMessage)
    })

    $("#messageToSend").on('keypress', function(){

        socket.emit("typing", "Deejay Sharma")
    })

}// end chat socket function

chatSocket();