module.exports = {
    HOST: 'database',
    USER: 'root',
    PORT: '3306',
    PASSWORD: 'admin',
    DB: 'users',
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };