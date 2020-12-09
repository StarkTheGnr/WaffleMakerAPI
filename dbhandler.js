const mysql = require('mysql');

module.exports = new class DBHandler
{
	pool = mysql.createPool(
	{
		connectionLimit: 10,
		host: "localhost",
		user: "root",
		password: "root123*",
		database: "wafflemachine"
	});

	createOrder(waffles, chocolate, transNum, amountPaid)
	{
		let SQL = `INSERT INTO orders 
					VALUES(0, ${waffles}, ${chocolate}, ${amountPaid}, 0, '${transNum}');`; //TODO: check for SQL injection
		
		return new Promise((resolve, reject) => { 
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				resolve(results['insertId']);
			})
		});
	}

	setOrderAsDone(orderId)
	{
		let SQL = `UPDATE orders 
					SET status=1
					WHERE order_id=${orderId};`;

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				resolve(true);
			})
		});
	}

	trackOrder(orderId)
	{
		let SQL = `SELECT status
					FROM orders
					WHERE order_id=${orderId};`;

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				if(results.length > 0)
					resolve(results[0]['status']);
				else
					resolve(-1);
			})
		});
	}

	getOrders(count, page)
	{
		let SQL = `SELECT order_id, waffle_num, chocolate_num, amount_paid, trans_num
					FROM orders
					LIMIT ${count}
					OFFSET ${(page - 1) * count};`

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				if(results.length > 0)
					resolve(results);
				else
					resolve(-1);
			})
		});	
	}

	getTotalOrderCount()
	{
		let SQL = `SELECT SUM(waffle_num) as waffleTotal, SUM(chocolate_num) as chocolateTotal
					FROM orders;`;

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				if(results.length > 0)
					resolve(results);
				else
					resolve(-1);
			})
		});	
	}
}