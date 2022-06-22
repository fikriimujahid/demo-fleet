module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      email_verified_at: {
        type: Sequelize.DATE
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deleted_by: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE
      },
      photo: {
        type: Sequelize.STRING
      },
    });
    return Users;
  };