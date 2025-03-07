const express = require('express');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Auth = require('../middleware/auth');

const router = express.Router();

// get orders
router.get('/orders', Auth, async(req, res) => {
    try {
        const orders = await Order.find({
            owner: req.user._id
        });

        if (!orders.length) throw new Error('you have no orders');

        res.status(200).send({orders});
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
    }
});

// checkout 
router.post('/order/checkout', Auth, async(req, res) => {
    try {
        const cart = await Cart.findOne({
            owner: req.user._id
        });

        if (!cart) throw new Error('you have no cart');
        if (!cart.items.length) throw new Error('your cart is empty');

        const order = new Order({
            owner: cart.owner,
            items: cart.items,
            bill: cart.bill
        });

        await order.save();

        cart.items = [];
        cart.bill = 0;
        await cart.save();

        res.status(201).send({
            message: 'order created successfully',
            order
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        })
    }
})

module.exports = router;