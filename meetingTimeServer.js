import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import http from "http";
import https from "https";

const app = express();
const port = 3000;

const clientMap = new Map();
let nextClientID = 0;
const meetings = new Map();

/*const httpsServer = https.createServer({
key: fs.readFileSync("server.key"),
cert: fs.readFileSync("server.cert"),
requestCertificate: false,
rejectUnauthorized: false // only for self-signed; do not use in production
}, app);
*/

const httpServer = http.createServer(app);


const corsOptions = {
origin: "https://richcaloggero.space:443",
methods: "POST",
//allowedHeaders: "Content-Type",
optionsSuccessStatus: 200
};

app.use(express.json()) // for parsing application/json
//app.use(cors(corsOptions));


app.get("/client/:name", (req, res) => {
console.log("request client: ", req.params.name);
res.sendFile(req.params.name, {
root: path.join(process.cwd(), "html")
});
});

//app.post("/data/", cors(corsOptions), async (req, res) => {
app.post("/data/", async (req, res) => {
const query = req.query;
const data = req.body;
console.log("got data: ", data);
updateMeetingList(data.meeting);
respondToClients(data.clientID, data.meeting);

try {
fs.writeFileSync("meetings.json", JSON.stringify([...meetings.values()]), {flush: true});
res.json({status: true, error: ""});

} catch(error) {
res.json({status: false, error: error});
} // try

return;
}); // post

app.get("/events/", async (req, res) => {
const clientID = clientInit (res);
sendClientEvent(res, "connected", {id: clientID});

console.log(`client ${clientID} connected.`);

const intervalID = setInterval(() => {
sendClientEvent(res, "keepAlive");

    }, 30000); // send keepAlive every 30 seconds

res.on('close', () => {
console.log('client dropped me');
clearInterval(intervalID);
clientMap.delete(clientID);
console.log("client map: ", clientMap);
res.end();
});
}); // server sent events

httpServer.listen(port, () => {
console.log(`http server Listening on port ${port}`);
});

function updateMeetingList (meeting) {
meetings.set(meeting.id, meeting);
} // updateMeetingList

function respondToClients (clientID, data) {
// respond to all others
clientMap.forEach((clientData, id) => {
if (id !== clientID) {
sendClientEvent(clientMap.get(id).res, "update", {id, from: clientID, data});
} // if
}); // forEach
} // respondToClients

function clientInit (res) {
const id = (nextClientID += 1);
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Connection", "keep-alive");
res.flushHeaders(); // flush the headers to establish SSE with client

clientMap.set (id, {id, res});
return id;
} // clientInit

function sendClientEvent (res, event, data) {
if (event === "keepAlive") {
res.write(":keep alive\n\n");
} else {
res.write(`event: ${event}
data: ${isString(data)? data : JSON.stringify(data)}
\n`);
} // if
} // sendClientEvent

function isString (x) {return typeof(x) === "string" || (x instanceof String);} 
function not(x) {return !x;}
