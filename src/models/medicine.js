module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define("Medicine", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    createdBy: {
      type: DataTypes.TEXT,
    },
  });

  return Medicine;
};
