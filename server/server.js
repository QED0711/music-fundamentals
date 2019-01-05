const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema')

const mongoose = require('mongoose');
mongoose.connect("mongodb://qdizon:test123@ds249824.mlab.com:49824/music-fundamentals", {useNewUrlParser: true});
mongoose.connection.once('open', () => {
    console.log("===== Connected to Database =====");
})

const port = process.env.PORT || 4000;

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen(port, () => {
    console.log("Now listening for request on http://localhost:4000/graphql");
})


