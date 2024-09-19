import repl from "repl";const meetingExpirationInterval = 24 * 7; // hoursconst removalCheckInterval = 3600000; // milliseconds = 1 hourimport fs from "fs";import path from "path";import express from "express";import cors from "cors";import http from "http";//import https from "https";const app = express();const port = Number(process.argv[1]) || 3000;const clientMap = new Map();let nextClientID = 0;const meetings = new Map();loadMeetingData("meetings.json", meetings);removeOldMeetings();const httpServer = http.createServer(app);const corsOptions = {origin: "https://richcaloggero.space:443",methods: "POST",allowedHeaders: "Content-Type",optionsSuccessStatus: 200};app.use(express.json()) // for parsing application/jsonapp.use(cors(corsOptions));app.get("/client/:name.:ext", (req, res) => {res.sendFile(`${req.params.name}.${req.params.ext}`, {root: path.join(process.cwd(), "html")});});app.post("/data", cors(corsOptions), async (req, res) => {//res.setHeader("Access-Control-Allow-Origin", "*");const query = req.query;const data = req.body;//console.log("got data: ", data);if (not(data) || not(data.meeting) || not(data.meeting.id)) {console.error("invalid data from client:\n", data);res.json({status: false, error: "invalid data"});return;} // ifupdateMeetingList(data.meeting);respondToOtherClients(data.clientID, data.meeting);//console.log(`${data.meeting.id} updated`);try {fs.writeFileSync("meetings.json", JSON.stringify([...meetings.values()]), {flush: true});res.json({status: true, error: ""});} catch(error) {res.json({status: false, error: error});} // tryreturn;}); // postapp.get("/events", async (req, res) => {const clientID = clientInit (res);sendClientEvent(res, "connected", {id: clientID, meetings: [...meetings.values()]});//console.log(`client ${clientID} connected.`);const intervalID = setInterval(() => {sendClientEvent(res, "keepAlive");}, 30000); // send keepAlive every 30 secondsres.on('close', () => {//console.log('client dropped me');clearInterval(intervalID);clientMap.delete(clientID);//console.log("client map: ", clientMap.size);res.end();}); // interval}); // server sent eventshttpServer.listen(port, () => {console.log(`http server Listening on port ${port}`);});function updateMeetingList (meeting) {//console.log("updateMeetingList: ", meeting);if (not(meeting.timestamp)) meeting.timestamp = Date.now();meetings.set(meeting.id, meeting);} // updateMeetingListfunction removeOldMeetings () {setInterval(() => {meetings.forEach(meeting => {const now = Date.now();const d = new Date(now - meeting.timestamp);if (d.getUTCHours() > meetingExpirationInterval) {meetings.delete(meeting.id);try {fs.writeFileSync("meetings.json", JSON.stringify([...meetings.values()]), {flush: true});//console.log(`Autoremove: ${meeting.id}`);} catch (e) {console.error(`removeOldMeetings: database write error; ${e}`);} // try} // if}); // forEach meeting}, removalCheckInterval);} // removeOldMeetingsfunction respondToOtherClients (clientID, data) {// respond to all othersclientMap.forEach((clientData, id) => {if (id !== clientID) {sendClientEvent(clientMap.get(id).res, "update", {id, from: clientID, meeting: data});} // if}); // forEach} // respondToOtherClientsfunction clientInit (res) {const id = (nextClientID += 1);res.setHeader("Cache-Control", "no-cache");res.setHeader("X-Accel-Buffering", "no");res.setHeader("Content-Type", "text/event-stream");//res.setHeader("Connection", "keep-alive");res.flushHeaders(); // flush the headers to establish SSE with clientclientMap.set (id, {id, res});return id;} // clientInitfunction sendClientEvent (res, event, data) {if (event === "keepAlive") {res.write(":keep alive\n");} else {res.write(`event: ${event}data: ${isString(data)? data : JSON.stringify(data)}\n`);} // if} // sendClientEventfunction loadMeetingData (file, map) {try {const list = JSON.parse(fs.readFileSync(file));if (not(list) || not(list instanceof Array)) throw new Error("database invalid");for (const meeting of list) {map.set(meeting.id, meeting);} // for} catch (e) {console.log("database invalid; setting to empty list");fs.writeFileSync("meetings.json", "[]");} // tryconsole.log(`${map.size} items loaded.`);} // loadMeetingDatafunction isEqual (o1, o2) {if (typeof(o1) === "object" && typeof(o2) === "object") {const k1 = Object.keys(o1);const k2 = Object.keys(o2);if (k1.length !== k2.length) return false;for (key of k1) {if (o1.hasOwnProperty(key) && o2.hasOwnProperty(key) && isEqual(o1[key], o2[key])) continue;return false;} // forreturn true;} else {return o1 === o2;} // if} // isEqualfunction isString (x) {return typeof(x) === "string" || (x instanceof String);} function not(x) {return !x;}