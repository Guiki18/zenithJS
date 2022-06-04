const colors = require('colors/safe');

module.exports = async function() {
	const express = require('express');
	const app = express();
	const port = 8080;
	app.get('/', (req, res) => res.send('Hello World!'));
	app.listen(port, () => console.log(colors.brightYellow(`App is listening at http://localhost:${port}`)));
};