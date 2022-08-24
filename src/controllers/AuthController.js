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
      email: Joi.string().email().min(5).required().messages({
        "string.min": "Email must be 5 characters",
        "string.email": "Invalid email",
        "string.empty": "Email is required",
      }),
      password: Joi.string().min(5).required().messages({
        "string.min": "Password must be 5 characters",
        "string.empty": "Password is required",
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

    const emailExist = await users.findOne({
      where: {
        email: data.email,
      },
    });

    if (emailExist) {
      return res.status(400).send({
        status: "error",
        message: "Email already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const addUser = await users.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return res.status(201).send({
      status: "register success",
      data: {
        name: addUser.name,
        email: addUser.email,
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

exports.login = async (req, res) => {
  const data = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  });

  const { error } = schema.validate(data);

  if (error) {
    return res.status(400).send({
      status: "error",
      message: error.details[0].message,
    });
  }

  try {
    const userExist = await users.findOne({
      where: {
        email: data.email,
      },
      attributes: {
        exclude: ["createdAt", "updateAt"],
      },
    });

    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email doesn't exist",
      });
    }

    const isMatch = await bcrypt.compare(data.password, userExist.password);

    if (!isMatch) {
      return res.status(400).send({
        status: "failed",
        message: "Password doesn't match",
      });
    }

    const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);

    return res.status(200).send({
      status: "login success",
      data: {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        token,
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
