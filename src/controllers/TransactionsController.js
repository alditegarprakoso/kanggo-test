const { users, products, transactions, payments } = require("../../models");
const Joi = require("joi");

exports.getTransactions = async (req, res) => {
  try {
    let data = await transactions.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: products,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: users,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
    });

    data = JSON.parse(JSON.stringify(data));

    return res.status(200).send({
      status: "success",
      message: "success get all transactions",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

exports.getTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    let data = await transactions.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: products,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: users,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
    });

    data = JSON.parse(JSON.stringify(data));

    return res.status(200).send({
      status: "success",
      message: "success get data transaction",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    let data = req.body;
    let user_id = req.user.id;

    const schema = Joi.object({
      product_id: Joi.number().integer().required().messages({
        "string.empty": "Product name is required",
      }),
      qty: Joi.number().integer().required().messages({
        "number.integer": "QTY must be a number",
        "number.empty": "QTY is required",
      }),
    });

    const { error } = schema.validate(data);

    if (error) {
      return res.status(400).send({
        status: "error",
        message: error.details[0].message,
      });
    }

    if (data.qty < 0 || data.qty == 0) {
      return res.status(400).send({
        status: "error",
        message: "invalid qty",
      });
    }

    const dataProduct = await products.findOne({
      where: {
        id: data.product_id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!dataProduct) {
      return res.status(404).send({
        status: "error",
        message: "product doesn't exist",
      });
    }

    const dataUser = await users.findOne({
      where: {
        id: user_id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!dataUser) {
      return res.status(404).send({
        status: "error",
        message: "user doesn't exist",
      });
    }

    let dataTransaction = {
      user_id,
      product_id: data.product_id,
      qty: data.qty,
      amount: dataProduct.price * data.qty,
      status: "pending",
    };

    if (dataProduct.qty - data.qty < 0) {
      return res.status(400).send({
        status: "error",
        message:
          "quantity exceeds product stock, please edit quantity on your transaction or contact our admin",
      });
    }

    const newTransaction = await transactions.create(dataTransaction);

    await payments.create({
      order_id: newTransaction.id,
      status: "unpaid",
    });

    let dataResponse = await transactions.findOne({
      where: {
        id: newTransaction.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: products,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: users,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
    });

    res.status(201).send({
      status: "success",
      message: "transaction success, product has been ordered",
      dataResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "transaction failed",
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = Joi.object({
      qty: Joi.number().integer().required().messages({
        "number.integer": "QTY must be a number",
        "number.empty": "QTY is required",
      }),
    });

    const { error } = schema.validate(data);

    if (error) {
      console.log(error);
      return res.status(400).send({
        status: "error",
        message: error.details[0].message,
      });
    }

    const dataTransaction = await transactions.findOne({
      where: {
        id: id,
      },
    });

    if (!dataTransaction) {
      return res.status(404).send({
        status: "error",
        message: "data transaction not found",
      });
    }

    const dataProduct = await products.findOne({
      where: {
        id: dataTransaction.product_id,
      },
    });

    if (dataProduct.qty - data.qty < 0) {
      return res.status(400).send({
        status: "error",
        message:
          "quantity exceeds product stock, please edit quantity on your transaction or contact our admin",
      });
    }

    const updateTransaction = await transactions.update(
      {
        qty: data.qty,
        amount: data.qty * dataProduct.price,
      },
      {
        where: {
          id: dataTransaction.id,
        },
      }
    );

    let dataResponse = await transactions.findOne({
      where: {
        id: dataTransaction.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: products,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: users,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
    });

    return res.status(200).send({
      status: "success",
      message: "success update transaction",
      dataResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};
