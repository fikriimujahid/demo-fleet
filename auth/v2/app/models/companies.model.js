module.exports = (sequelize, Sequelize) => {
    const Companies = sequelize.define("companies", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING
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
    return Companies;
  };