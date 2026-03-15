var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
const { default: slugify } = require('slugify');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let result = await productModel.find({
    isDeleted: false
  })
  res.send(result);
});
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findOne({
      isDeleted: false,
      _id: id
    })
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "ID NOT FOUND" });
    }
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

router.post('/', async function (req, res, next) {
  if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
    return res.status(400).send({ message: 'title is required' });
  }
  let newProduct = new productModel({
    title: req.body.title.trim(),
    slug: slugify(req.body.title.trim(), {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: false,
    }),
    price: req.body.price,
    description: req.body.description,
    images: req.body.images,
    category: req.body.category
  });
  await newProduct.save();
  res.send(newProduct)
})

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(id, req.body, {
      new: true
    });
    res.send(updatedItem)
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(id, {
      isDeleted: true
    }, {
      new: true
    });
    res.send(updatedItem)
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

module.exports = router;
