const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/AuthController");

const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductsController");

router.get("/", (req, res) => {
  res.send("Kanggo Test");
});

// Auth
router.post("/register", register);
router.post("/login", login);

// Products
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
router.post("/product", addProduct);
router.patch("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);

module.exports = router;
