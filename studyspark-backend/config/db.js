import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    
    // ✅ ADD THESE OPTIONS:
    define: {
      underscored: true,        // Use snake_case for column names
      freezeTableName: true,    // Prevent pluralization of table names
      timestamps: true
    }
  }
);

export default sequelize;