// import WebSocket, {WebSocketServer} from "ws";
// import url from "URL";
// const wss = new WebSocketServer({port: 3006});


// //array pof clients 
// allClients=[];

// wss.on("connection", function(ws, req){
//     console.log("connection insiated");
//     console.log(req.url)
//     console.log(req.query)
    
   
//     ws.id= "rahul";
  
//     ws.on("message", function message(message){
//         const data = JSON.parse(message);
//           console.log(wss.clients)
//         if(data.type === "message"){
//             wss.clients.forEach((client) => {
//                 console.log("client name"+client)
//                 console.log("client name"+client.id)
//              if (client !== ws && client.readyState === WebSocket.OPEN){
//                 client.send(JSON.stringify({type: "message", data: data.data}));
//              }   
//             })
//         }
//     })
// });

// // import WebSocket, { WebSocketServer } from "ws";
// // import { parse } from "url";

// // const wss = new WebSocketServer({ port: 3006 });

// // // Array to store WebSocket connections
// // const allClients = [];
// // // Array to store all URLs
// // const allUrls = [];

// // wss.on("connection", function (ws, req) {
// //     console.log("Connection initiated");

// //     // Parse the URL to extract user ID
// //     const parsedUrl = parse(req.url, true);
// //     const userId = parsedUrl.pathname.split("/").pop(); // Extract the last part of the path

// //     console.log("User ID:", userId);

// //     // Store the WebSocket connection in the array
// //     allClients.push({ userId, ws });
    
// //     // Store the URL in the array
// //     allUrls.push(req.url);
    
// //     // Log all URLs
// //     console.log("All URLs:", allUrls);

// //     ws.on("message", function message(message) {
// //         const data = JSON.parse(message);
// //         console.log(allClients);

// //         if (data.type === "message") {
// //             // Broadcast the message to all clients except the sender
// //             allClients.forEach((client) => {
// //                 if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
// //                     client.ws.send(JSON.stringify({ type: "message", data: data.data }));
// //                 }
// //             });
// //         }
// //     });
// // });
// import WebSocket, { WebSocketServer } from "ws";
// import { parse } from "url";
// import { v4 as uuidv4 } from "uuid";

// const wss = new WebSocketServer({ port: 3006 });

// // Array to store WebSocket connections
// const allClients = [];
// // Array to store all URLs
// const allUrls = [];

// wss.on("connection", function (ws, req) {
//     console.log("Connection initiated");

//     // Parse the URL to extract user ID
//     const parsedUrl = parse(req.url, true);
//     const userId = uuidv4(); // Generate a unique user ID

//     console.log("User ID:", userId);

//     // Store the WebSocket connection in the array
//     allClients.push({ userId, ws });
    
//     // Store the URL in the array
//     allUrls.push(req.url);
    
//     // Log all URLs
//     console.log("All URLs:", allUrls);

//     ws.on("message", function message(message) {
//         const data = JSON.parse(message);
//         console.log(allClients);

//         if (data.type === "message") {
//             // Broadcast the message to all clients except the sender
//             allClients.forEach((client) => {
//                 if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
//                     client.ws.send(JSON.stringify({ type: "message", data: data.data }));
//                 }
//             });
//         }
//     });
// });


// import WebSocket, { WebSocketServer } from "ws";
// import { parse } from "url";
// import { v4 as uuidv4 } from "uuid";

// const wss = new WebSocketServer({ port: 3006 });

// // Array to store WebSocket connections
// const allClients = [];
// // Array to store all URLs
// const allUrls = [];

// wss.on("connection", function (ws, req) {
//     console.log("Connection initiated");

//     // Parse the URL to extract user ID
//     const parsedUrl = parse(req.url, true);
//     const userId = uuidv4(); // Generate a unique user ID

//     console.log("User ID:", userId);

//     // Store the WebSocket connection in the array
//     allClients.push({ userId, ws });

//     // Store the URL in the array
//     allUrls.push(req.url);

//     // Log all URLs
//     console.log("All URLs:", allUrls);

//     ws.on("message", function message(message) {
//         const data = JSON.parse(message);
//         console.log(allClients);

//         if (data.type === "message") {
//             // Check if the message is intended for a specific user
//             if (data.targetUserId) {
//                 // Find the target user in the allClients array
//                 const targetClient = allClients.find((client) => client.userId === data.targetUserId);

//                 // If the target user is found, send the message
//                 if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
//                     targetClient.ws.send(JSON.stringify({ type: "message", data: data.data }));
//                 }
//             } else {
//                 // Broadcast the message to all clients except the sender
//                 allClients.forEach((client) => {
//                     if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
//                         client.ws.send(JSON.stringify({ type: "message", data: data.data }));
//                     }
//                 });
//             }
//         }
//     });
// });

// import WebSocket, { WebSocketServer } from "ws";
// import { parse } from "url";
// import { v4 as uuidv4 } from "uuid";

// const wss = new WebSocketServer({ port: 3006 });

// // Array to store WebSocket connections
// const allClients = [];
// // Array to store all URLs
// const allUrls = [];

// wss.on("connection", function (ws, req) {
//     console.log("Connection initiated");

//     // Parse the URL to extract user ID
//     const parsedUrl = parse(req.url, true);
//     const userId = uuidv4(); // Generate a unique user ID

//     console.log("User ID:", userId);

//     // Store the WebSocket connection in the array
//     allClients.push({ userId, ws });

//     // Store the URL in the array
//     allUrls.push(req.url);

//     // Log all URLs
//     console.log("All URLs:", allUrls);

//     ws.on("message", function message(msg) {
//         const data = JSON.parse(msg);
//         console.log(allClients);

//         if (data.type === "message") {
//             const senderUserId = userId; // Get the userId of the sender

//             // Check if the message is intended for a specific user
//             if (data.targetUserId) {
//                 // Find the target user in the allClients array
//                 const targetClient = allClients.find((client) => client.userId === data.targetUserId);

//                 // If the target user is found, send the message with sender's userId
//                 if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
//                     targetClient.ws.send(JSON.stringify({ type: "message", data: data.data, senderUserId }));
//                 }
//             } else {
//                 // Broadcast the message to all clients except the sender with sender's userId
//                 allClients.forEach((client) => {
//                     if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
//                         client.ws.send(JSON.stringify({ type: "message", data: data.data, senderUserId }));
//                     }
//                 });
//             }
//         }
//     });
// });


import WebSocket, { WebSocketServer } from "ws";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 3006 });

// Array to store WebSocket connections
const allClients = [];
// Array to store all URLs
const allUrls = [];

wss.on("connection", function (ws, req) {
    console.log("Connection initiated");

    // Parse the URL to extract user ID
    const parsedUrl = parse(req.url, true);
    const userId = parsedUrl.query.id || uuidv4(); // Use the provided userId or generate a unique user ID

    console.log("User ID:", userId);
    ws.id = userId; //we are setting the ws.id for the initiated client

    // Store the WebSocket connection in the array
    //allClients.push({ userId, ws});
    allClients.push(userId); //pushing the user ID into the array

    // Store the URL in the array
    allUrls.push(req.url);

    // Log all URLs
    console.log("All URLs:", allUrls);

    ws.on("message", function message(msg) {
        const data = JSON.parse(msg);
        console.log(allClients);
        console.log("reciver ID",data.receiverId, typeof(data.receiverId));

            // Check if the message is intended for a specific user
        if (data.type === "message" && data.receiverId) {
            const senderUserId = userId; // Get the userId of the sender
            // console.log(trim(str));
            // Find the target user in the wss.clients array
                // wss.clients.forEach((client)=>{
                //     if(client.id==data.receiverId){
                //         console.log("match found",client.id)
                //     }
                //     console.log(client.id, typeof(client.id))
                // })
                // var targetClient="";
                 wss.clients.forEach((client) => {
                    console.log(client);
                   if(client.id === data.receiverId) {
                     if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: "message", data: data.data, senderUserId }));
                           }
                   } else {
                    console.log("no client found");
                   }
                });

                
            //      console.log("target client"+targetClient.);
            //     // If the target user is found, send the message with sender's userId
            //     if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            //         targetClient.ws.send(JSON.stringify({ type: "message", data: data.data, senderUserId }));
            //     }
            // } else {
            //     // Broadcast the message to all clients except the sender with sender's userId
            //     // allClients.forEach((client) => {
            //     //     if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
            //     //         client.ws.send(JSON.stringify({ type: "message", data: data.data, senderUserId }));
            //     //     }
            //     // });
            //     console.log("send error message back to the client");
            // }
        }
        
     } )
});


