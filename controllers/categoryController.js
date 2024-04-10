const categoryCollection = require("../Model/categoryModel");
const productCollection = require("../Model/productModel")



const categoriesPage = async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = 8;
      let skip = (page - 1) * limit;
      let count = await categoryCollection.find().estimatedDocumentCount();
      let categoryData = await categoryCollection.find().skip(skip).limit(limit);
      res.render("admin/Category.ejs", {
        categoryData,
        count,
        limit,
        categoryExists: req.session.categoryExists,
      });
      req.session.categoryExists = null;
    } catch (error) {
      console.error(error);
    }
  };

  const addCategoriesPage = async (req, res) => {
    console.log(req.session.categoryExists)
    res.render("admin/addCategory.ejs",{categoryExists:req.session.categoryExists});
    req.session.categoryExists = false
  };


  const addCategory = async (req, res) => {
    try {
      let categoryName = req.body.categoriesName;
      let categoryExists = await categoryCollection.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });
      console.log(categoryExists);
      console.log(req.body);
      if (!categoryExists) {
        await new categoryCollection({
          categoryName: req.body.categoriesName,
          categoryDescription: req.body.categoriesDescription,
        }).save();
        req.session.categoryExists = false
        console.log("Added category");
        res.redirect("/admin/categories");
      } else {
       // const exsittext = "Category already exists!"
        req.session.categoryExists = true
        res.redirect("/admin/addCategories");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };


  const editCategory = async (req, res) => {
    req.session.categoryExists;
  
    try {
      console.log(req.params.id);
      let data = await categoryCollection.findOne({ _id: req.params.id });
  
      res.render("admin/editCategory.ejs", {
        data: data,
        categoryExists: req.session.categoryExists,
      });
      req.session.categoryExists = false;
     req.session.save();
    } catch (error) {
      console.error(error);
    }
  };
  

  const editCategoriesPage = async (req, res) => {
    try {
      console.log(req.body);
      let categoryName = req.body.categoriesName;
      let categoryExists = await categoryCollection.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$, "i"`) },
      });
      console.log(categoryExists)
      if (!categoryExists) {
        await categoryCollection.findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              categoryName: req.body.categoriesName,
              categoryDescription: req.body.categoriesDescription,
            },
          }
        );
        // console.log();
        res.redirect("/admin/categories");
      } else {
        console.log("Category already exists!");
        req.session.categoryExists = true; 
        res.redirect('back');
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };


  const listCategory = async (req, res) => {
    try {
      console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
         let list =  await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      console.log(list)
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
    }
  };
  const unlistCategory = async (req, res) => {
    try {
     let unlist =  await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      console.log(unlist)
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
    }
  };

  const categoryFilterfn = async (req,res)=>{
    try{
      if(req.query.categoriesName =="All"){
        req.session.shopProductData = await productCollection.find({isListed:true})
        req.session.count = (req.session.shopProductData).length 
        req.session.save()
        res.redirect("/productCategory")
      }else{
        req.session.shopProductData = await productCollection.find({isListed:true,parentCategory:req.query.categoriesName})
        req.session.count = (req.session.shopProductData).length 
        req.session.save()
        res.redirect("/productCategory")
      }
    }catch(err){
        console.log(`Error from categories filter page ${err}`)
    }
  }

  module.exports = 
  {
    categoriesPage,
    addCategoriesPage,
    addCategory,
    editCategory,
    editCategoriesPage,
    listCategory,
    unlistCategory,
    categoryFilterfn,
  }









                               

