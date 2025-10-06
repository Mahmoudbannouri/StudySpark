import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Quota from "./Quota.js"; // add this line

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("student", "admin"),
    defaultValue: "student",
  },
});


// 🔗 Relations
User.hasOne(Quota, { foreignKey: "userId", onDelete: "CASCADE" });
Quota.belongsTo(User, { foreignKey: "userId" });

export default User;
