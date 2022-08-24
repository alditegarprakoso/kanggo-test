const { users } = require("../../models");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const data = req.body;

    const schema = Joi.object({
      name: Joi.string().min(3).required().messages({
        "string.min": "Name must be 3 characters",
        "string.empty": "Name is required",
      }),
      emailRegister: Joi.string().email().min(5).required().messages({
        "string.min": "Email must be 5 characters",
        "string.email": "Invalid email",
        "string.empty": "Email is required",
      }),
      passwordRegister: Joi.string().min(5).required().messages({
        "string.min": "Password must be 5 characters",
        "string.empty": "Password is required",
      }),
      gender: Joi.string().required().messages({
        "string.empty": "Gender is required",
      }),
      phone: Joi.number().integer().required().messages({
        "number.integer": "Phone must be a number",
        "number.empty": "Phone is required",
      }),
      address: Joi.string().min(12).required().messages({
        "string.min": "Address must be 12 characters",
        "string.empty": "Address is required",
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

    if (data.phone.length < 12) {
      return res.status(400).send({
        status: "error",
        message: "Phone must be 12 characters",
      });
    }

    const emailExist = await User.findOne({
      where: {
        email: data.emailRegister,
      },
    });

    if (emailExist) {
      return res.status(400).send({
        status: "error",
        message: "Email already exist",
      });
    }

    const phoneExist = await User.findOne({
      where: {
        phone: data.phone,
      },
    });

    if (phoneExist) {
      return res.status(400).send({
        status: "error",
        message: "Phone number already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.passwordRegister, salt);

    const addUser = await User.create({
      name: data.name,
      email: data.emailRegister,
      password: hashedPassword,
      status: "customer",
      gender: data.gender,
      phone: data.phone,
      address: data.address,
    });

    return res.status(201).send({
      status: "success",
      data: {
        name: addUser.name,
        email: addUser.email,
        password: addUser.password,
        status: addUser.status,
        gender: addUser.gender,
        phone: addUser.phone,
        address: addUser.address,
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
