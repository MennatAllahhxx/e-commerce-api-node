const express = require('express');
const userRoutes = require('./routers/user');
const itemRoutes = require('./routers/item');
const cartRoutes = require('./routers/cart');
require('./db/mongoose');

const app = express();
app.use(express.json());

app.use(userRoutes);
app.use(itemRoutes);
app.use(cartRoutes);

const port = process.env.PORT;
app.listen(port, () => {
    console.log('server listening on port: ' + port);
})