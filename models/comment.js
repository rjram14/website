module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define("Comment", {
    comm_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    blog_id: {
      type: Sequelize.INTEGER,
    },
    u_id: {
      type: Sequelize.UUID,
    },
    email: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    comment: {
      type: Sequelize.STRING,
    },
  });

  return Comment;
};
