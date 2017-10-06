const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, "../public");
const port = 3000 || process.env.PORT;

var app = express();
app.use(express.static(publicPath));

app.listen(port, () => {
	console.log("Server is listening on "+port);
});