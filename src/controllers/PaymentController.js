const { transactions, payments, products } = require("../../models");
const Joi = require("joi");

exports.getPayments = async (req, res) => {
  try {
    let data = await payments.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: transactions,
          as: "transaction",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    data = JSON.parse(JSON.stringify(data));

    return res.status(200).send({
      status: "success",
      message: "success get all payments",
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

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = Joi.object({
      amount: Joi.number().integer().required().messages({
        "number.integer": "Amount must be a number",
        "number.empty": "Amount is required",
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

    const dataPayment = await payments.findOne({
      where: {
        id: id,
      },
    });

    if (!dataPayment) {
      return res.status(404).send({
        status: "failed",
        message: "data payment not found",
      });
    }

    const dataTransaction = await transactions.findOne({
      where: {
        id: dataPayment.order_id,
      },
    });

    if (data.amount != dataTransaction.amount) {
      return res.status(400).send({
        status: "failed",
        message: "the amount paid must match the bill",
      });
    }

    const dataProduct = await products.findOne({
      where: {
        id: dataTransaction.product_id,
      },
    });

    if (dataProduct.qty - dataTransaction.qty < 0) {
      return res.status(400).send({
        status: "error",
        message:
          "quantity exceeds product stock, please edit quantity on your transaction or contact our admin",
      });
    }

    const updatePayment = await payments.update(
      {
        amount: data.amount,
        status: "paid",
      },
      {
        where: {
          id: id,
        },
      }
    );

    const updateProduct = await products.update(
      {
        qty: dataProduct.qty - dataTransaction.qty,
      },
      {
        where: {
          id: dataProduct.id,
        },
      }
    );

    const updateTransaction = await transactions.update(
      {
        status: "paid",
      },
      {
        where: {
          id: dataTransaction.id,
        },
      }
    );

    let dataResponse = await payments.findOne({
      where: {
        id: id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: transactions,
          as: "transaction",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    return res.status(200).send({
      status: "success",
      message: "payment success",
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
