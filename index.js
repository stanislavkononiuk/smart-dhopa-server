const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 4200;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v9ypd.mongodb.net/${process.env
	.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const orders = client.db('smartDhopa').collection('orders');
	console.log('Orders connection successfully');

	// Update Order Status
	app.post('/updateOrder', (req, res) => {
		const ap = req.body;
		orders.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { status: ap.status, progress: ap.progress }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result);
				}
			}
		);
	});

	// Update Order details
	app.post('/updateOrderDetails', (req, res) => {
		const od = req.body;
		orders.updateOne(
			{ _id: ObjectId(od.id) },
			{
				$set: { shipment: od.shipment, products: od.products, price: od.price }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result);
				}
			}
		);
	});

	// Added Place Order
	app.post('/addOrders', (req, res) => {
		const newOrder = req.body;
		orders.insertOne(newOrder).then((result) => {
			res.send(result.insertedCount > 0);
		});
		// console.log(newOrder);
	});

	// Get specific user Orders
	app.get('/orders', (req, res) => {
		// console.log(req.query.email);
		orders.find({ email: req.query.email }).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Get all Orders
	app.get('/allOrders', (req, res) => {
		orders.find({}).toArray((err, documents) => {
			res.send(documents);
		});
    });
    
    
});

client.connect((err) => {
	const products = client.db('smartDhopa').collection('products');
	console.log('Products connection successfully');

	// Update Product Information
	app.post('/updateProduct', (req, res) => {
		const pd = req.body;
		products.updateOne(
			{ _id: ObjectId(pd.id) },
			{
				$set: { name: pd.name, price: pd.price }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result);
				}
			}
		);
	});

	// Get all products
	app.get('/products', (req, res) => {
		products.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Add Products in inventory
	app.post('/addProducts', (req, res) => {
		const allProduct = req.body;
		products.insertOne(allProduct).then((result) => {
			console.log(result.insertedCount);
			res.send(result.insertedCount > 0);
		});
	});

	// Delete Product
	app.delete('/deleteProducts/:id', (req, res) => {
		console.log(req.params.id);

		products.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
			res.send(result.deletedCount > 0);
		});
    });
    

});

// Root Route
app.get('/', (req, res) => {
	res.send('Welcome to Smart Dhopa');
});

// PORT
app.listen(process.env.PORT || port, () => {
	console.log('listening on port');
});
