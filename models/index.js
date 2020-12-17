const { Sequelize } = require("sequelize");
const config = require("../config/db").dev;

// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.localhost,
  dialect: config.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Users = require("./user.js")(sequelize, Sequelize);
db.Payment = require("./payment.js")(sequelize, Sequelize);
db.Otp = require("./otp.js")(sequelize, Sequelize);
db.Blog = require("./blog.js")(sequelize, Sequelize);
db.Comment = require("./comment.js")(sequelize, Sequelize);

db.Payment.belongsTo(db.Users, { foreignKey: "u_id" });
db.Users.hasMany(db.Payment, { foreignKey: "u_id" });

db.Otp.belongsTo(db.Users, { foreignKey: "u_id" });
db.Users.hasMany(db.Otp, { foreignKey: "u_id" });

db.Blog.belongsTo(db.Users, { foreignKey: "u_id" });
db.Users.hasMany(db.Blog, { foreignKey: "u_id" });

db.Comment.belongsTo(db.Blog, { foreignKey: "blog_id" });
db.Blog.hasMany(db.Comment, { foreignKey: "blog_id" });

module.exports = db;

// module.exports = sequelize;
