module.exports = (sequelize, Sequelize) => {
  const Blog = sequelize.define("Blog", {
    blog_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    u_id: {
      type: Sequelize.UUID,
    },
    title: {
      type: Sequelize.STRING,
    },
    photo: {
      type: Sequelize.STRING,
    },
    category: {
      type: Sequelize.STRING,
    },
    BlogBody: {
      type: Sequelize.TEXT,
    },
    isDeleted: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });

  return Blog;
};
