
const userRoute = require("../Router/adminRouter");
const userdata = require("../Model/userModel");
const productCollection = require("../Model/productModel")
const dashboard = require("../service/dashboardChart");

//requiring bcrypt
const bcrypt = require("bcrypt");

const loadLogin = async (req, res) => {
    try {
      if (req.session.isAdmin) {
        res.render("admin/dashboard");
      } else {
        res.render("admin/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //admin login verfy
  const verifyLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userData = await userdata.findOne({ email });
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.Password);
        if (passwordMatch) {
          req.session.user_id = userData._id;
          req.session.isLoggedin = true;
          if (userData.is_admin === 0) {
            res.render("admin/login", {
              message: "Email and password incorrect",
            });
          } else {
            req.session.isAdmin = true;
            res.redirect("/admin/adminHome");
          }
        } else {
          res.render("admin/login", { message: "Email and password incorrect" });
        }
      } else {
        res.render("admin/login", { message: "Email and password incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const adminHome = async (req, res) => {
    try {
      const userData = await userdata.findById({ _id: req.session.user_id });
      let productData =
        req.session?.shopProductData ||
        (await productCollection.find({ isListed: true }));
      
      if (!productData) {
        productData = [];
      }
      // console.log(productData)
  
      res.render("admin/dashboard", { productData, userData });
    } catch (error) {
      console.log(error.message);
    }
  };

  const dashboardData = async (req, res) => {
    try {
      const [
        productsCount,
        categoryCount,
        pendingOrdersCount,
        completedOrdersCount,
        currentDayRevenue,
        MonthlyRevenue,
        categoryWiseRevenue,
        shipping,
      ] = await Promise.all([
        dashboard.productsCount(),
        dashboard.categoryCount(),
        dashboard.pendingOrdersCount(),
        dashboard.completedOrdersCount(),
        dashboard.currentDayRevenue(),
        dashboard.MonthlyRevenue(),
        dashboard.categoryWiseRevenue(),
        dashboard.shipping(),
      ]);
  
      const data = {
        productsCount,
        categoryCount,
        pendingOrdersCount,
        completedOrdersCount,
        currentDayRevenue,
        MonthlyRevenue,
        categoryWiseRevenue,
        shipping,
      };
      res.json(data);
    } catch (error) {
      console.log(error);
    }
  };

  //logout function
const adminLogout = async (req, res) => {
    try {
      // req.session.destroy();
      // req.session.userId = false
      // req.session.isLoggedin = false
      req.session.isAdmin = false;
      req.session.admin = null;
      res.redirect("/admin");
    } catch (error) {
      console.log(error.message);
    }
  };
  const userListController = async (req, res) => {
    try {
      if (req.session.isAdmin) {
        let users;
        let count;
        let page = Number(req.query.page) || 1;
        let limit = 5;
        let skip = (page - 1) * limit;
        if (!req.session.allUser) {
          count = await userdata.find().estimatedDocumentCount();
          users = await userdata.find().skip(skip).limit(limit);
        } else {
          users = req.session.allUser;
        }
        res.render("admin/userMangement", { users, count, limit });
        req.session.allUser = null;
        req.session.save();
      } else {
        res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const unblockUserController = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userdata.findByIdAndUpdate(id, { isBlocked: false });
      req.session.isBlocked = false
      req.session.save()
      res.status(200).send({success : ture})
    } catch (error) {
      console.log(error);
    }
  };
  const blockUserController = async (req, res) => {
    try {
      const id  = req.params.id;
      const user = await userdata.findByIdAndUpdate(id, { isBlocked: true });
      req.session.isBlocked = true
      req.session.save()  

      res.status(200).send({success : ture})
    } catch (error) {
      console.log(error);
    }
  };
  
  module.exports = {
    loadLogin,
    verifyLogin,
    adminHome,
    adminLogout,
    userListController,
    unblockUserController,
    blockUserController,
    dashboardData
  }

