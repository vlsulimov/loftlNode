const http = require("http");

let users = [];
let interval = 1000;
let stop = 30;
let port = 3001;

http.createServer(function (req, res) {
    if (req.url = '/time') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        users.push(res);
    }
}).listen(port);
console.log(`running on http://localhost:${port}`);

setTimeout(function timer() {
    let now = new Date();
    if (now.getSeconds() % stop === 0) {
        users.map(res => {
            res.write(now + ' END\n');
            res.end();
        });
        users = [];
    }
    users.map(res => {
        res.write(now + '\n');
    });
    console.log(now);
    setTimeout(timer, interval);
}, interval);