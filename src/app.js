const express = require('express');
require('./db/mongoose');

const app = express();
app.use(express.json());

const userRoutes = require('./routers/user');
app.use(userRoutes);

const itemRoutes = require('./routers/item');
app.use(itemRoutes);

const cartRoutes = require('./routers/cart');
app.use(cartRoutes);

const port = process.env.PORT;
app.listen(port, () => {
    console.log('server listening on port: ' + port);
})