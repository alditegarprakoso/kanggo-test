const { products } = require("../../models");
const Joi = require("joi");

exports.getProducts = async (req, res) => {
  try {
    const data = await products.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (data.length < 1) {
      return res.status(404).send({
        status: "failed",
        message: "data products not found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "success get data products",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await products.findOne({
      where: {
        id: id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!data) {
      return res.status(404).send({
        status: "failed",
        message: "data product not found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "success get data product",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const data = req.body;

    const schema = Joi.object({
      name: Joi.string().min(3).required().messages({
        "string.min": "Product name must be 3 characters",
        "string.empty": "Product name is required",
      }),
      price: Joi.number().integer().required().messages({
        "number.integer": "Price must be a number",
        "number.empty": "Price is required",
      }),
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

    if (data.price == 0 || data.price < 0) {
      return res.status(400).send({
        status: "error",
        message: "invalid price",
      });
    }

    if (data.qty < 0) {
      return res.status(400).send({
        status: "error",
        message: "invalid qty",
      });
    }

    const dataExist = await products.findOne({
      where: {
        name: data.name,
      },
    });

    if (dataExist) {
      return res.status(400).send({
        status: "error",
        message: "product name is already exist",
      });
    }

    const addProduct = await products.create({
      name: data.name,
      price: data.price,
      qty: data.qty,
    });

    return res.status(201).send({
      status: "success",
      message: "success insert data product",
      data: {
        name: addProduct.name,
        price: addProduct.price,
        qty: addProduct.qty,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = Joi.object({
      name: Joi.string().min(3).required().messages({
        "string.min": "Product name must be 3 characters",
        "string.empty": "Product name is required",
      }),
      price: Joi.number().integer().required().messages({
        "number.integer": "Price must be a number",
        "number.empty": "Price is required",
      }),
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

    const dataExist = await products.findOne({
      where: {
        id: id,
      },
    });

    if (!dataExist) {
      return res.status(404).send({
        status: "error",
        message: "data product not found",
      });
    }

    if (dataExist.name !== data.name) {
      const nameExist = await products.findOne({
        where: {
          name: data.name,
        },
      });

      if (nameExist) {
        return res.status(400).send({
          status: "error",
          message: "data product is already exist",
        });
      }
    }

    const updateProduct = await products.update(
      {
        name: data.name,
        price: data.price,
        qty: data.qty,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.status(200).send({
      status: "success",
      message: "success update data product",
      data: {
        id: id,
        name: data.name,
        price: data.price,
        qty: data.qty,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const dataExist = await products.findOne({
      where: {
        id: id,
      },
    });

    if (!dataExist) {
      return res.status(404).send({
        status: "error",
        message: "data product not found",
      });
    }

    const deleteProduct = await products.destroy({
      where: {
        id: id,
      },
    });

    return res.status(200).send({
      status: "success",
      message: "success delete data product",
      data: {
        id: id,
        name: dataExist.name,
        price: dataExist.price,
        qty: dataExist.qty,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
