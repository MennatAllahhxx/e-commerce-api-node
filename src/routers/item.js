const express = require('express');
const Item = require('../models/item');
const Auth = require('../middleware/auth');

const router = express.Router();

// create item
router.post('/items', Auth, async (req, res) => {
    req.body.owner = req.user;
    const item = new Item(req.body);
    try {
        await item.save();
        res.status(201).send({item});
    } catch (error) {
        res.status(400).send(error);
    }
});

// get item
router.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        res.status(200).send({item});
    } catch (error) {
        res.status(404).send({
            message: 'item not found',
            details: error.message
        });
    }
});

// get all items
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).send({items});
    } catch (error) {
        res.status(404).send({
            message: 'error getting all items',
            details: error.message
        });
    }
})

// update item 
router.patch('/items/:id', Auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'price', 'category'];

    const invalidKeys = updates.filter(update => !allowedUpdates.includes(update));

    if (invalidKeys.length > 0) {
        return res.status(400).send({
            message: 'Invalid update keys',
            keys: invalidKeys
        });
    }

    try {
        const item = await Item.findById(req.params.id);

        if(!item) {
            return res.status(404).send('item does not exist');
        }

        if(item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send('Not allowed to modify this item');
        }

        updates.forEach((update) => {
            item[update] = req.body[update];
        });

        await item.save();
        res.status(200).send({item});
    } catch (error) {
        res.status(500).send({
            message: 'Couldnt update item',
            details: error.message
        });
    }
});

// delete item
router.delete('/items/:id', Auth, async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);

        if(!item) {
            return res.status(404).send('item does not exist');
        }

        if(item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send('Not allowed to modify this item');
        }

        res.status(200).send({
            message: "Item deleted",
            item
        });
    } catch (error) {
        res.status(500).send({
            message: 'Couldnt delete item',
            details: error.message
        });
    }
});

module.exports = router;