require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.300zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  tls: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

function run() {
//   try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const movieCollection = client.db('movieDB').collection('movie');
    const favMovieCollection = client.db('movieDB').collection('fav-movie');
    const userCollection = client.db('movieDB').collection('user');

    app.get('/addmovie', (req, res) => {
      const cursor = movieCollection.find().sort( { "rating": -1 } ).toArray()
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error retrieving movies.' });
        });
    });

    app.get('/movie/:id', (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      movieCollection.findOne(query)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error retrieving the movie.' });
        });
    });

    app.post('/addmovie', (req, res) => {
      const newMovie = req.body;
      movieCollection.insertOne(newMovie)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error adding the movie.' });
        });
    });

    app.get('/favourites', (req, res) => {
      favMovieCollection.find().toArray()
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error retrieving favorites.' });
        });
    });

    app.get('/favourites/:id', (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      favMovieCollection.findOne(query)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error retrieving the favorite movie.' });
        });
    });

    app.post('/favourites/:id', (req, res) => {
      const favMovie = req.body;
      favMovieCollection.insertOne(favMovie)
        .then(result => {
          res.send(result);
        })
        .catch(error => {
          res.status(500).send({ error: 'Error inserting the favorite movie.' });
        });
    });

    app.delete('/favourites/:id', (req, res) => {
      const id = req.params.id;
      const query = {_id: id}
      favMovieCollection.deleteOne(query)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error deleting the favorite movie.' });
        });
    });

    app.put('/movie/:id', (req, res) => {
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

      movieCollection.updateOne(filter, movie, options)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error updating the movie.' });
        });
    })

    app.delete('/movie/:id', (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      movieCollection.deleteOne(query)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error deleting the movie.' });
        });
    });

    app.post('/users', (req, res) => {
      const newUser = req.body;
      userCollection.insertOne(newUser)
        .then(result => res.send(result))
        .catch(error => {
          res.status(500).send({ error: 'Error adding the user.' });
        });
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
}
// run().catch(console.dir);

run();



app.get('/', (req, res) => {
    res.send(`CineMate server is running`);
});

app.listen(port, () => {
    console.log(`CineMate server is running at port: ${port}`);
})