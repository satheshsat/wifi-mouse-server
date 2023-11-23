const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const PORT = 4445;
var robot = require("robotjs");
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:3000",
	},
});
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

console.log(results)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let mouse;
socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);

	socket.on('moveMouse', (data) => {
		if(!mouse){
			console.log(mouse)
			mouse = robot.getMousePos();
		}else{
			mouse.x = mouse.x+data.x;
			mouse.y = mouse.y+data.y;
		}
		robot.moveMouse(mouse.x, mouse.y)
	})

	socket.on('mouseClick', (key) => {
		robot.mouseClick(key)
	})

	socket.on("disconnect", () => {
		socket.disconnect();
		console.log("🔥: A user disconnected");
	});
});

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});