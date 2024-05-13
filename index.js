
// import express from 'express';
// import { createServer } from 'http';
// import WebSocket, { WebSocketServer } from "ws";
// import { parse } from "url";
// import { v4 as uuidv4 } from "uuid";


// const app = express();
// const server = createServer(app);

// // const wss = new WebSocketServer({ port: 3006 });
// const wss = new WebSocketServer({ noServer: true });

// // Object to store WebSocket connections keyed by userId
// const clients = {};

// //for testing cyclic or vercel or heroku cloud
// app.get("/", (req, res, next)=>{
//     res.json({
//         name:"chat-app",
//         message:"i am working"
//     });
// });

// wss.on("connection", function (ws, req) {
//     console.log("Connection initiated");

//     // Parse the URL to extract user ID
//     const parsedUrl = parse(req.url, true);
//     const userId = decodeURIComponent(parsedUrl.query.id) || uuidv4();
//     console.log("User ID:", userId);
//     ws.id = userId; // Assign the userId to the WebSocket connection

//     // Store the WebSocket connection in the clients object
//     clients[userId] = ws;

//     ws.on("message", function message(msg) {
//         const data = JSON.parse(msg);
//         console.log(data);
//         console.log("Received message from", ws.id);

//         // Check if the message is intended for a specific user
//         if (data.type === "message" && data.receiverId) {
//             const receiverId = data.receiverId;
//             const targetClient = clients[receiverId];

//             // If the target user is found and the WebSocket is open, send the message
//             if (targetClient && targetClient.readyState === WebSocket.OPEN) {
//                 targetClient.send(JSON.stringify({ type: "message", data: data.data, senderUserId: ws.id, senderName: data.senderName }));

//             } else {
//                 console.log("No client found with the receiverId:", receiverId);
//                 // Optionally, send an error message back to the sender
//                 ws.send(JSON.stringify({ type: "error", message: "Receiver not found or connection closed." }));
//             }
//         } else {
//             console.log("Message type not supported or receiverId missing.");
//         }
//     });

//     ws.on("close", function close() {
//         console.log("Connection closed for user:", ws.id);
//         // Remove the WebSocket connection from the clients object
//         delete clients[ws.id];
//     });
// });

// // Handle upgrade of the request
// server.on('upgrade', function upgrade(request, socket, head) {
//     const { pathname } = parse(request.url);

//     if (pathname === '/') {
//         wss.handleUpgrade(request, socket, head, function done(ws) {
//             wss.emit('connection', ws, request);
//         });
//     } else {
//         socket.destroy();
//     }
// });

// setInterval(() => {
//     wss.clients.forEach((client) => {
//       client.send(new Date().toTimeString());
//     });
//   }, 10000);

// // Start the server
// const PORT = process.env.PORT || 3006;
// server.listen(PORT, function() {
//     console.log(`Server is running on port ${PORT}`);
// });

// console.log(`WebSocket server is running on port 3006.`);




// online status code
import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from "ws";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";
import fetch from 'node-fetch';
import moment from 'moment';

// import { sendNotification } from './notificationHandler.js';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Object to store WebSocket connections keyed by userId
const clients = {};

//this is for online users
const onlineUsers = [];

// Object to store messages for offline users
const messageQueue = [];

function getUserIdFromWebSocket(ws) {
    console.log("this is userId: " + ws.id);
    return ws.id; // or however you have stored the user ID on the WebSocket object
    
}

function broadcastOnlineUsers() {
    // Create a list of users with their online status and last connected time
    const usersStatus = Object.keys(clients).map(userId => ({
      userId: userId,
      online: clients[userId].online,
      lastConnected: clients[userId].lastConnected
    }));
  
    const message = JSON.stringify({
      type: 'onlineUsers',
      body: {
        usersStatus // Send the updated users status
      }
    });
  
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  
app.get("/", (req, res, next) => {
    res.json({
        name: "chat-app",
        message: "i am working"
    });
});

wss.on("connection", function (ws, req) {

    const ip = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.log(`Connection initiated from IP: ${ip}, User-Agent: ${userAgent}`);
    console.log("Connection initiated");

    const parsedUrl = parse(req.url, true);
    const userId = decodeURIComponent(parsedUrl.query.id) || uuidv4();
    console.log("User ID:", userId);

    if (!userId) {
      console.log("Undefined userId, terminating connection");
      ws.terminate(); // Close the connection
      return; // Stop further execution for this connection attempt
     }
    ws.id = userId;

    // clients[userId] = ws;

    console.log(clients);

    // Update the clients object with connection status and last connected time
    clients[userId] = {
        ws: ws,
        online: true,
        lastConnected: moment().toISOString() // Store the current time in ISO format
    };

    // Broadcast online users
    broadcastOnlineUsers();

    // Check for and send any messages that were queued for this user
    if (messageQueue[userId]) {
        messageQueue[userId].forEach((queuedMessage) => {
            ws.send(JSON.stringify(queuedMessage));
        });
        delete messageQueue[userId]; // Clear the message queue for this user
    }

    ws.on("message", async function message(msg) {
        const data = JSON.parse(msg);
        console.log(data);
        console.log("Received message from", ws.id);

        
        //for status handling
        if (data.type === 'status') {
          const userId = data.userId;
          if (data.status === 'online') {
            // Update user status to online
            clients[userId].online = true;
          } else if (data.status === 'offline') {
            // Update user status to offline
            setUserOffline(userId);
          }
        }



        if (data.type === "message" && data.receiverId) {
            // const receiverId = "+" + data.receiverId;
            const receiverId = data.receiverId;

            console.log("this is the receiverId", receiverId);

            // const targetClient = clients[receiverId];
            const targetClient = clients[receiverId].ws;


            console.log("this is  the client: ",targetClient);


            if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                targetClient.send(JSON.stringify({ type: "message", data: data.data, senderUserId: ws.id, senderName: data.senderName }));
            } else {
                console.log("Receiver is offline, queuing message");
                // Store the message in the queue for the receiver
                if (!messageQueue[receiverId]) {
                    messageQueue[receiverId] = [];
                }
                messageQueue[receiverId].push({ type: "message", data: data.data, senderUserId: ws.id, senderName: data.senderName });

                // Send a notification to the receiver that they have a new message
                try {
                    // You need to have the externalUserId for the receiver to send a notification
                    // This should be a unique identifier for the user that matches the one used in OneSignal
                    // const externalUserId = receiverId; // Replace this with the actual external user ID if it's different from receiverId
                    // await sendNotification("You have a new message!", [externalUserId]);
                    // console.log(`Notification sent to user ${receiverId}`);

                    // const message = "You have a new message!";
                    const message = `You have a new message from ${data.senderName}: ${data.data}`;
                    const externalUserIds = ["+" + receiverId]; // Replace with actual receiver IDs
                    const senderName = data.senderName; // Replace with actual sender name
                    const additionalData = data.data; // Replace with actual additional data

                    // await sendNotification("You have a new message!", [receiverId]);
                    await sendNotification(message, externalUserIds, senderName, additionalData);
                    console.log(`Notification sent to user ${receiverId}`);
                } catch (error) {
                    console.error(`Failed to send notification to user ${receiverId}`, error);
            }
    
         }
        } else {
            console.log("Message type not supported or receiverId missing.");
        }
        // addOnlineUser(ws);
        getUserIdFromWebSocket(ws);
    });

    // ws.on("close", function close() {
    //     console.log("Connection closed for user:", ws.user_id);
    //     delete clients[ws.user_id];

    //     removeOnlineUser(ws);
    // });
    ws.on("close", function close() {
        const userId = ws.id; // Assuming ws.id is the userId
        console.log("Connection closed for user:", userId);
        
        if (clients[userId]) {
          clients[userId].online = false;
          clients[userId].lastConnected = moment().toISOString(); // Update last connected time
          broadcastOnlineUsers(); // Broadcast the updated online users list
          handleUserDisconnect(ws);

        }
      });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);

    if (pathname === '/') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});


const sendNotification = async (message, externalUserIds, senderName, additionalData) => {
    const ONE_SIGNAL_APP_ID = '63fac062-7831-4ccd-b35a-37ed0eaab9bd';
    const REST_API_KEY = 'Zjc4OGVmYWYtMjA2My00NDJlLTg1YTUtZjUxZDBiYWE0Njc3';
  
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${REST_API_KEY}`
    };

    //notification payload
    const payload = {
      app_id: ONE_SIGNAL_APP_ID,
      contents: { "en": message },
      include_external_user_ids: externalUserIds, // Assuming you're using external user IDs
      data: { // Additional data field
        senderName: senderName,
        additionalData: additionalData
      }
    };
  
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
  
    const data = await response.json();
    console.log(data);
    return data;
  };
  

setInterval(() => {
    wss.clients.forEach((client) => {
        client.send(new Date().toTimeString());
    });
}, 10000);

const PORT = process.env.PORT || 3009;
server.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});


// Function to update user status to offline
function setUserOffline(userId) {
  if (clients[userId]) {
    clients[userId].online = false;
    clients[userId].lastConnected = moment().toISOString();
    broadcastOnlineUsers();
  }
}

// Function to handle user disconnection
function handleUserDisconnect(ws) {
  const userId = getUserIdFromWebSocket(ws);
  console.log("Connection closed for user:", userId);
  setUserOffline(userId);
}

// WebSocket connection event
wss.on("connection", function (ws, req) {
  ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
  // Handle WebSocket close event
  ws.on("close", function close() {
    handleUserDisconnect(ws);
  });
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
});
});
//maintain an array with client Id connection status online or offline and last time connected
//after archiving this build a ws based service to know the user current status










// import express from 'express';
// import { createServer } from 'http';
// import WebSocket, { WebSocketServer } from "ws";
// import { parse } from "url";
// import { v4 as uuidv4 } from "uuid";
// import moment from 'moment';



// const app = express();
// const server = createServer(app);

// // const wss = new WebSocketServer({ port: 3006 });
// const wss = new WebSocketServer({ noServer: true });

// // Object to store WebSocket connections keyed by userId
// const clients = {};

// const messageQueue = [];


// //for testing cyclic or vercel or heroku cloud
// app.get("/", (req, res, next)=>{
//     res.json({
//         name:"hello",
//         message:"i am working"
//     });
// });

// wss.on("connection", function (ws, req) {
//     console.log("Connection initiated");

//     // Parse the URL to extract user ID
//     const parsedUrl = parse(req.url, true);
//     const userId = decodeURIComponent(parsedUrl.query.id) || uuidv4();
//     console.log("User ID:", userId);
//     ws.id = userId; // Assign the userId to the WebSocket connection

//     console.log(clients);


//     // Store the WebSocket connection in the clients object
//     // clients[userId] = ws;

//     // Update the clients object with connection status and last connected time
//     clients[userId] = {
//       ws: ws,
//       online: true,
//       lastConnected: moment().toISOString() // Store the current time in ISO format
//   };

//     ws.on("message", async function message(msg) {
//         const data = JSON.parse(msg);
//         console.log("Received message from", ws.id);

//         // Check if the message is intended for a specific user
//         if (data.type === "message" && data.receiverId) {
//             const receiverId = data.receiverId;
            
//             console.log(receiverId);

//             const targetClient = clients[receiverId].ws;

//             // If the target user is found and the WebSocket is open, send the message
//             if (targetClient && targetClient.readyState === WebSocket.OPEN) {
//                 // targetClient.send(JSON.stringify({ type: "message", data: data.data, senderUserId: ws.id }));
//                 targetClient.send(JSON.stringify({ type: "message", data: data.data, senderUserId: ws.id, senderName: data.senderName }));

//             } else {
//               console.log("Receiver is offline, queuing message");
//               // Store the message in the queue for the receiver
//               if (!messageQueue[receiverId]) {
//                   messageQueue[receiverId] = [];
//               }
//               messageQueue[receiverId].push({ type: "message", data: data.data, senderUserId: ws.id, senderName: data.senderName });

//               // Send a notification to the receiver that they have a new message
//               try {
//                   // You need to have the externalUserId for the receiver to send a notification
//                   // This should be a unique identifier for the user that matches the one used in OneSignal
//                   // const externalUserId = receiverId; // Replace this with the actual external user ID if it's different from receiverId
//                   // await sendNotification("You have a new message!", [externalUserId]);
//                   // console.log(`Notification sent to user ${receiverId}`);

//                   // const message = "You have a new message!";
//                   const message = `You have a new message from ${data.senderName}: ${data.data}`;
//                   const externalUserIds = ["+" + receiverId]; // Replace with actual receiver IDs
//                   const senderName = data.senderName; // Replace with actual sender name
//                   const additionalData = data.data; // Replace with actual additional data

//                   // await sendNotification("You have a new message!", [receiverId]);
//                   await sendNotification(message, externalUserIds, senderName, additionalData);
//                   console.log(`Notification sent to user ${receiverId}`);
//               } catch (error) {
//                   console.error(`Failed to send notification to user ${receiverId}`, error);
//           }
  
//        }

//               // Check for and send any messages that were queued for this user
//             if (messageQueue[userId]) {
//               messageQueue[userId].forEach((queuedMessage) => {
//                   ws.send(JSON.stringify(queuedMessage));
//               });
//               delete messageQueue[userId]; // Clear the message queue for this user
//           }
//         } else {
//             console.log("Message type not supported or receiverId missing.");
//         }
//     });

//     ws.on("close", function close() {
//         console.log("Connection closed for user:", ws.id);
//         // Remove the WebSocket connection from the clients object
//         delete clients[ws.id];
//     });
// });

// // Handle upgrade of the request
// server.on('upgrade', function upgrade(request, socket, head) {
//     const { pathname } = parse(request.url);

//     if (pathname === '/') {
//         wss.handleUpgrade(request, socket, head, function done(ws) {
//             wss.emit('connection', ws, request);
//         });
//     } else {
//         socket.destroy();
//     }
// });


// const sendNotification = async (message, externalUserIds, senderName, additionalData) => {
//   const ONE_SIGNAL_APP_ID = '63fac062-7831-4ccd-b35a-37ed0eaab9bd';
//   const REST_API_KEY = 'Zjc4OGVmYWYtMjA2My00NDJlLTg1YTUtZjUxZDBiYWE0Njc3';

//   const headers = {
//     "Content-Type": "application/json; charset=utf-8",
//     "Authorization": `Basic ${REST_API_KEY}`
//   };

//   //notification payload
//   const payload = {
//     app_id: ONE_SIGNAL_APP_ID,
//     contents: { "en": message },
//     include_external_user_ids: externalUserIds, // Assuming you're using external user IDs
//     data: { // Additional data field
//       senderName: senderName,
//       additionalData: additionalData
//     }
//   };

//   const response = await fetch('https://onesignal.com/api/v1/notifications', {
//     method: 'POST',
//     headers: headers,
//     body: JSON.stringify(payload)
//   });

//   const data = await response.json();
//   console.log(data);
//   return data;
// };


// // Start the server
// const PORT = process.env.PORT || 3009;
// server.listen(PORT, function() {
//     console.log(`Server is running on port ${PORT}`);
// });

// // console.log(`WebSocket server is running on port 3006.`);