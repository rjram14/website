module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("Payment", {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
        },
        u_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
        order_id: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
        product_info: {
            type: Sequelize.STRING
        },
        transaction_id: {
            type: Sequelize.STRING
        },
        hash: {
            type: Sequelize.STRING
        },
        transaction_status: {
            type: Sequelize.STRING
        },
        message: {
            type: Sequelize.STRING
        }



    });

    return Payment;
};