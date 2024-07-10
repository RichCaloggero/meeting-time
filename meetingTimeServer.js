import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import http from "http";
import https from "https";

const app = express();
const port = 3000;

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
app.use(cors(corsOptions));


app.get("/:name", (req, res) => {
//console.log("request: ", req);
res.sendFile(req.params.name, {
root: path.join(process.cwd(), "html")
});
});

app.post("/data/", cors(corsOptions), async (req, res) => {
const query = req.query;
const buffer = req.body;
console.log(`
got data; buffer length: ${buffer.length};
query string: ${JSON.stringify(query)}
data: ${buffer}
`);

try {

} catch(error) {
res.json({error: {status: 500, data: "unknown server error"}});
} // try

return;
}); // post

httpServer.listen(port, () => {
console.log(`http server Listening on port ${port}`);
});

