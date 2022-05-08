const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.avasa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//adding items
async function run() {
    try {
        await client.connect()

        const productCollection = client.db('spiceKart').collection('product')

        app.post('/inventory', async (req, res) => {
            const newProducts = req.body
            const product = await productCollection.insertOne(newProducts)
            res.send(product)


        })

        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.get('/inventory/myItems', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = { email: email }
            const cursor = productCollection.find(query)
            const product = await cursor.toArray()
            res.send(product)
        })






        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result)
            console.log(result)
        })


        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const updatedProduct = req.body
            console.log(updatedProduct)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updatedProduct.quantity
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        //adding email from login
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })

        })


    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('warehouse management')
})

app.listen(port, () => {
    console.log('Listening to port', port)
})