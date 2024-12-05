const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.300zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const movieCollection = client.db('movieDB').collection('movie');
    const favMovieCollection = client.db('movieDB').collection('fav-movie');
    const userCollection = client.db('movieDB').collection('user');

    app.get('/addmovie', async(req, res) => {
      const cursor = movieCollection.find().sort( { "rating": -1 } );
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/movie/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await movieCollection.findOne(query);
      res.send(result);
    });

    app.post('/addmovie', async(req, res) => {
        const newMovie = req.body;
        console.log(newMovie)
        const result = await movieCollection.insertOne(newMovie);
        res.send(result);
    });

    app.get('/favourites', async(req, res) => {
      const cursor = favMovieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/favourites/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await favMovieCollection.findOne(query);
      res.send(result);
    });

    app.post('/favourites/:id', async(req, res) => {
      const favMovie = req.body;
      console.log(favMovie)
      const result = await favMovieCollection.insertOne(favMovie);
      res.send(result);
    });

    app.delete('/favourites/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: id}
      const result = await favMovieCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/movie/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert : true}
      const updatedMovie = req.body;

      const movie = {
        $set: {
          title: updatedMovie.title,
          genre: updatedMovie.genre,
          poster: updatedMovie.poster,
          duration: updatedMovie.duration,
          year: updatedMovie.year,
          rating: updatedMovie.rating,
          summary: updatedMovie.summary
        }
      }

      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);
    })

    app.delete('/movie/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/users', async(req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(`CineMate server is running`);
});

app.listen(port, () => {
    console.log(`CineMate server is running at port: ${port}`);
})