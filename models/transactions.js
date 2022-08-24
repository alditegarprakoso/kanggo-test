"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transactions.belongsTo(models.users, {
        as: "users",
        foreignKey: {
          name: "user_id",
        },
      });

      transactions.belongsTo(models.products, {
        as: "products",
        foreignKey: {
          name: "product_id",
        },
      });

      transactions.hasOne(models.payments, {
        as: "payments",
        foreignKey: {
          name: "order_id",
        },
      });
    }
  }
  transactions.init(
    {
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "transactions",
    }
  );
  return transactions;
};
