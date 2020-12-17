module.exports = (sequelize, Sequelize) => {
    const Otp = sequelize.define("Otp", {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
        },
        // u_id: {
        //     type: Sequelize.INTEGER,
        //     autoIncrement: true,
        //     primaryKey: true
        // },
        u_id: {
            type: Sequelize.UUID
        },
        otp: {
            type: Sequelize.STRING
        }
    });

    return Otp;
};