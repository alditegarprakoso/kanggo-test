const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/Auth");

const { register, login } = require("../controllers/AuthController");

const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductsController");

const {
  getTransactions,
  addTransaction,
} = require("../controllers/TransactionsController");

const {
  getPayments,
  updatePayment,
} = require("../controllers/PaymentController");

router.get("/", (req, res) => {
  res.send("Kanggo Test");
});

// Auth
router.post("/register", register);
router.post("/login", login);

// Products
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
router.post("/product", auth, addProduct);
router.patch("/product/:id", auth, updateProduct);
router.delete("/product/:id", auth, deleteProduct);

// Transactions
router.get("/transactions", getTransactions);
router.post("/transaction", auth, addTransaction);

// Payments
router.get("/payments", getPayments);
router.patch("/payment/:id", updatePayment);

module.exports = router;
