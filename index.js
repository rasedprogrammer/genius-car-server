const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Server configuration

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@programmingherocluster.fdfar9q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		const serviceCollection = client.db("geniusCar").collection("services");
		const orderCollection = client.db("geniusCar").collection("orders");

		app.get("/services", async (req, res) => {
			// Conditional query
			const search = req.query.search;
			let query = {};
			if (search.length) {
				query = {
					$text: {
						$search: search,
					},
				};
			}
			// const query = { price: { $gt: 100, $lt: 200 } };
			// const query = { price: { $gte: 100 } };
			// const query = { price: { $lte: 100 } };
			// const query = { price: { $ne: 150 } };
			// const query = { price: { $in: [150, 20, 30] } };
			// const query = { price: { $nin: [150, 40] } };

			// Compresion query
			// const query = { $and: [{ price: { $gt: 20 } }, { price: { $gt: 100 } }] };
			const order = req.query.order === "asc" ? 1 : -1;
			const cursor = serviceCollection.find(query).sort({ price: order });
			// const cursor = serviceCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});

		app.get("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = ObjectId(id);
			const service = await serviceCollection.findOne(query);
			res.send(service);
		});

		// Orders API
		app.get("/orders", async (req, res) => {
			let query = {};
			if (req.query.email) {
				query = { email: req.query.email };
			}
			const cursor = orderCollection.find(query);
			const orders = await cursor.toArray();
			res.send(orders);
		});
		app.post("/orders", async (req, res) => {
			const order = req.body;
			const result = await orderCollection.insertOne(order);
			res.send(result);
		});
		app.patch("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const status = req.body.status;
			const query = { _id: ObjectId(id) };
			const updatedDoc = {
				$set: {
					status: status,
				},
			};
			const result = await orderCollection.updateOne(query, updatedDoc);
			res.send(result);
		});
		app.delete("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orderCollection.deleteOne(query);
			res.send(result);
		});
	} finally {
	}
}
run().catch((err) => console.error(err));

// Default Server configuration
app.get("/", (req, res) => {
	res.send("Hello From NodeJs Server!!!");
});

app.listen(port, () => {
	console.log(`Listening genius car server from port ${port}`);
});
