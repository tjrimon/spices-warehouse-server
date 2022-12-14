const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB}:${process.env.PASS}@cluster0.62mn9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//run function
async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('spicesWarehouse').collection('spices');

        // all inventory api
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventory = await cursor.toArray();
            res.send(inventory);
        });

        //jwt auth

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })
        // single inventory api
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const data = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    ...data
                },
            };
            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // add inventory
        app.post('/add', async (req, res) => {
            const data = req.body;
            const result = await inventoryCollection.insertOne(data);
            res.send(result)
        });


        // delete inventory
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });


    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Im Running');
});


app.listen(port, () => {
    console.log('Listening to port', port);
})
