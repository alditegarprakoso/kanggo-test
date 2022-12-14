"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      products.hasMany(models.transactions, {
        as: "transactions",
        foreignKey: {
          name: "product_id",
        },
      });
    }
  }
  products.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "products",
    }
  );
  return products;
};
