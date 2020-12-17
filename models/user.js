module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("Users", {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        mobileNo: {
            type: Sequelize.STRING
        },
        otp: {
            type: Sequelize.STRING
        },
        accessType: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    return Users;
};



