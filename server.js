const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema.js');

const port = process.env.PORT || 3000;

const app = express();

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(port, () => {
    console.log('Server is up on port: ' + port);
});