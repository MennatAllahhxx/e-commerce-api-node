const express = require('express');
const Cart = require('../models/cart');
const Item = require('../models/item');
const Auth = require('../middleware/auth');
const _ = require('lodash');

const router = express.Router();

// create cart
router.post('/cart', Auth, async (req, res) => {
    const owner = req.user._id;
    const items = req.body.items;

    try {
        const itemIds = items.map(item=> item.itemId);
        let cart = await Cart.findOne({ owner });
        
        if (!cart) {
            cart = new Cart();
            cart.owner = owner;
        }

        const itemsFound = await Item.find({
            '_id': {
                '$in': itemIds
            }
        }).select('_id name price');

        if ( itemsFound.length > 1) {

            itemsFound.forEach(itemFound => {
                const cartItem = cart.items.find(item => item['itemId'].toString() === itemFound._id.toString());
                const quantity = items.find(item => item['itemId'] == itemFound._id.toString()).quantity;                

                if (!cartItem && quantity >= 0 ) {
                    if (quantity > 0) {
                        cart.items.push({
                            itemId: itemFound._id,
                            name: itemFound.name,
                            price: itemFound.price,
                            quantity
                        });
                    }
                } else {
                    if (quantity == 0) cart.items.remove(cartItem._id);
                    else if (quantity < 0) throw new Error('Quantity can not be in negative value');
                    else cartItem.quantity += quantity;
                }
            })
            cart.bill = _.sum(cart.items.map(item => item.quantity * item.price));
            await cart.save();
        }

        res.status(200).send(cart);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

// get cart
router.get('/cart', Auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            owner: req.user._id
        });
        
        if (!cart) throw Error;
        res.status(200).send({cart});
    } catch (error) {
        res.status(404).send({
            message: "you dont have a cart"
        });
    }
});

module.exports = router;