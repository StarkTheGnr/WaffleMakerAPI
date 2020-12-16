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
		let SQL = `SELECT order_id, waffle_num, chocolate_num, amount_paid, status, trans_num
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

	getDailyOrderCount()
	{
		let SQL = `SELECT count(order_id) as Count, day(date_created) as Day FROM wafflemachine.orders
					WHERE date_created >= DATE(NOW()) - INTERVAL 7 DAY
					GROUP BY day(date_created);`;

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				if(results.length > 0)
				{
					let finalCount = [];
					let finalDays = [];

					for(let i = 0; i < results.length; i++)
					{
						finalCount.push(results[i]['Count']);
						finalDays.push(results[i]['Day']);
					}

					resolve([finalCount, finalDays]);
				}
				else
					resolve(-1);
			})
		});	
	}

	getDailyRevenue()
	{
		let SQL = `SELECT sum(order_id) as Revenue, day(date_created) as Day FROM wafflemachine.orders
					WHERE date_created >= DATE(NOW()) - INTERVAL 7 DAY
					GROUP BY day(date_created);`;

		return new Promise((resolve, reject) => {
			this.pool.query(SQL, (error, results, fields) => 
			{
				if(error)
				{
					console.log("Error executing SQL: " + error);
					reject(error);
				}

				if(results.length > 0)
				{
					let finalRevenue = [];
					let finalDays = [];

					for(let i = 0; i < results.length; i++)
					{
						finalRevenue.push(results[i]['Revenue']);
						finalDays.push(results[i]['Day']);
					}

					resolve([finalRevenue, finalDays]);
				}
				else
					resolve(-1);
			})
		});	
	}
}