// Model Database:- will be used to query database
var Blog = require("../models/index").Blog;
var db = require("../models/index");
var passport = require("passport");
var jwt = require("jsonwebtoken");

module.exports = function (app) {
  // Route for Creating Blog
  app.post(
    "/createBlog",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      // variable to store blog details
      let loggedInUser = req.user;
      if (loggedInUser.accessType != 1) {
        return res.json({
          status: false,
          data: [],
          message:
            "You are not admin and does not have access to create Blogs.",
        });
      }
      const reqQuery = req.body;
      const category = reqQuery.category;
      const BlogBody = reqQuery.blog;
      const title = reqQuery.title;
      const photo = reqQuery.photo;
      const u_id = loggedInUser.u_id;
      try {
        Blog.create({ u_id, category, BlogBody, title, photo }).then((blog) => {
          const payload = {
            blog_id: blog.id,
            u_id: blog.u_id,
            blogBody: blog.BlogBody,
            title: blog.title,
            photo: blog.photo,
          };
          res.json({ status: true, message: { blog: payload } });
        });
      } catch (err) {
        done(err);
      }
    }
  );

  //   Route for getting blogs
  app.get("/getBlog/:blogId", (req, res) => {
    //   blogId will be in url as "?blogId=something"
    let blog_id = req.params.blogId;
    db.Blog.findAll({
      where: {
        blog_id: blog_id,
        isDeleted: 0,
      },
    })
      .then((blog) => {
        console.log(blog.length);
        if (blog.length > 0) {
          res.json({ status: true, data: blog[0] });
        } else {
          res.json({ status: false, data: blog[0] });
        }
      })
      .catch((e) => {
        console.log(e);
        res.json({ status: false, data: [] });
      });
  });

  app.get("/getAllBlogs", (req, res) => {
    console.log(req.query);
    console.log("PageNum:-", req.query.page);
    let page = req.query.page ? req.query.page : 1;
    let limit = 3;
    db.Blog.findAll({
      offset: (page - 1) * limit,
      limit: limit,
      order: [["createdAt", "DESC"]],
      where: {
        isDeleted: 0,
      },
    })
      .then((blog) => {
        console.log(blog.length);
        res.json({ status: true, data: blog });
      })
      .catch((e) => {
        console.log(e);
        res.json({ status: false, data: [] });
      });
    // res.json({ status: true, data });
  });

  //   Route for posting comments
  app.post("/comment", (req, res) => {
    //  commentDetails variable
    let commentDetails = req.body;
  });

  // demo route to get logged in user's data
  app.get(
    "/userData",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      console.log(req.user);
      res.json(req.user);
    }
  );

  app.post(
    "/updateBlog",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      // variable to store blog details
      let loggedInUser = req.user;
      if (loggedInUser.accessType != 1) {
        return res.json({
          status: false,
          data: [],
          message:
            "You are not admin and does not have access to create Blogs.",
        });
      }
      const reqQuery = req.body;
      const category = reqQuery.category;
      const BlogBody = reqQuery.blog;
      const title = reqQuery.title;
      const photo = reqQuery.photo;
      const blogId = reqQuery.blogId;
      const u_id = loggedInUser.u_id;
      try {
        Blog.findOne({ where: { blog_id: blogId } }).then(async (blog) => {
          if (blog) {
            blog.category = category;
            blog.BlogBody = BlogBody;
            blog.title = title;
            blog.photo = photo;
            blog.u_id = u_id;
          }
          await blog.save();
          const payload = {
            blog_id: blog.id,
            u_id: blog.u_id,
            blogBody: blog.BlogBody,
            title: blog.title,
            photo: blog.photo,
          };
          res.json({ status: true, message: { blog: payload } });
        });
      } catch (err) {
        done(err);
      }
    }
  );

  app.post(
    "/deleteBlog",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      // variable to store blog details
      let loggedInUser = req.user;
      if (loggedInUser.accessType != 1) {
        return res.json({
          status: false,
          data: [],
          message:
            "You are not admin and does not have access to create Blogs.",
        });
      }
      const reqQuery = req.body;
      const isDeleted = 1;
      const blogId = reqQuery.blogId;
      const u_id = loggedInUser.u_id;
      try {
        Blog.findOne({ where: { blog_id: blogId } }).then(async (blog) => {
          if (blog) {
            blog.isDeleted = isDeleted;
            blog.u_id = u_id;
          }
          await blog.save();
          const payload = {
            blog_id: blog.id,
            u_id: blog.u_id,
            blogBody: blog.BlogBody,
            title: blog.title,
            photo: blog.photo,
          };
          res.json({ status: true, message: { blog: payload } });
        });
      } catch (err) {
        res.json({ status: false, message: { blog: payload } });
      }
    }
  );
};
