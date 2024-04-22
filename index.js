
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

// // console.log(`WebSocket server is running on port 3006.`);
import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from "ws";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";

import { sendNotification } from './notificationHandler.js';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Object to store WebSocket connections keyed by userId
const clients = {};

// Object to store messages for offline users
const messageQueue = {};

app.get("/", (req, res, next) => {
    res.json({
        name: "chat-app",
        message: "i am working"
    });
});

wss.on("connection", function (ws, req) {
    console.log("Connection initiated");

    const parsedUrl = parse(req.url, true);
    const userId = decodeURIComponent(parsedUrl.query.id) || uuidv4();
    console.log("User ID:", userId);
    ws.id = userId;

    clients[userId] = ws;

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

        if (data.type === "message" && data.receiverId) {
            const receiverId = data.receiverId;
            const targetClient = clients[receiverId];

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
                    const externalUserId = receiverId; // Replace this with the actual external user ID if it's different from receiverId
                    await sendNotification("You have a new message!", [externalUserId]);
                    console.log(`Notification sent to user ${receiverId}`);
                } catch (error) {
                    console.error(`Failed to send notification to user ${receiverId}`, error);
            }
    
         }
        } else {
            console.log("Message type not supported or receiverId missing.");
        }
    });

    ws.on("close", function close() {
        console.log("Connection closed for user:", ws.id);
        delete clients[ws.id];
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

setInterval(() => {
    wss.clients.forEach((client) => {
        client.send(new Date().toTimeString());
    });
}, 10000);

const PORT = process.env.PORT || 3006;
server.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});