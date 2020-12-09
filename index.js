
const PORT = 8000;
const ADMIN_USERNAME = "test";
const ADMIN_PASSWORD = "test";

const express = require('express');
const bodyParser = require('body-parser');
const dbHandler = require('./dbHandler.js');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'testPass'}));

app.post('/new_order', (req, res) => {
	let waffleQuantity = req.body.waffle_quantity;
	let chocolateNum = req.body.chocolate_numbers;
	let transactionNum = req.body.transaction_number;
	let amountPaid = req.body.amount_paid;

	if(isNaN(waffleQuantity) || waffleQuantity == "" || waffleQuantity < 1 || isNaN(chocolateNum) || chocolateNum == "" || chocolateNum < 0 
		|| transactionNum == undefined || transactionNum == "" || isNaN(amountPaid) || amountPaid == "" || amountPaid < 0)
	{
		res.sendStatus(400);
		return;
	}

	dbHandler.createOrder(waffleQuantity, chocolateNum, transactionNum, amountPaid).then((id) => {
		res.json({ accepted: 'true', order_id: id });	
	}).catch((err) => { res.json({ accepted: 'false', order_id: -1 }); });
});

app.get('/track_order', (req, res) => {
	let orderId = req.query.order_id;
	if(orderId == undefined || orderId == "" || isNaN(orderId) || orderId < 0)
	{
		res.sendStatus(400);
		return;
	}

	dbHandler.trackOrder(orderId).then((status) => {
		res.status(201).json({ order_status: status });
	}).catch((err) => res.sendStatus(400));
});

app.get('/dashboard', (req, res) => {
	let sess = req.session;
	if(sess.username == ADMIN_USERNAME && sess.password == ADMIN_PASSWORD)
	{
		let page = sess.query?.page_num;
		if(page == undefined)
			page = 1;

		dbHandler.getOrders(50, page).then(async (result) => {
			let orderTotal = await dbHandler.getTotalOrderCount();

			res.render(path.join(__dirname +'/dashboard.ejs'), { orders: result, orderCount: [orderTotal[0]['waffleTotal'], orderTotal[0]['chocolateTotal']] });
		}).catch(() => res.end("ERROR"));
	}
	else
		res.sendFile(path.join(__dirname +'/login.html'));
});

app.get('/signout', (req, res) => {
	let sess = req.session;
	req.session.destroy();

	res.redirect('/dashboard');
});

app.post('/login', (req, res) => {
	let sess = req.session;
	let username = req.body.username;
	let password = req.body.password;

	if(username == ADMIN_USERNAME && password == ADMIN_PASSWORD)
	{
		sess.username = username;
		sess.password = password;
	}

	res.redirect('/dashboard');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));