const categoryCollection = require("../Model/categoryModel");
const productCollection = require("../Model/productModel");

//    admin product process fn below
const productlist= async (req, res) => {
    try {
        let page = Number(req.query.page) || 1;
        let limit = 4;
        let skip = (page - 1) * limit;
        console.log(skip)
        console.log(limit)
        console.log(page)
        let   count = await productCollection.find().estimatedDocumentCount();
        let productData = await productCollection.find().skip(skip).limit(limit);
        let categoryList = await categoryCollection.find(
          { },
          { categoryName: true }
        );
        res.render("admin/productlist.ejs", {
          productData,
          categoryList,count,
          limit,
          productExist: req.session.productAlreadyExists,
        });
        req.session.productAlreadyExists = null;
      } catch (error) {
        console.error(error);
      }
  };


  const addProductPage = async (req, res) => {
    try {
      const categories = await categoryCollection.find({ isListed:true});
      console.log(categories);
      res.render("admin/addproduct.ejs", {
        categories,
      });
      req.session.productAlreadyExists = null;
    } catch (error) {
      console.error(error);
    }
  };


  const addProduct = async (req, res) => {
    console.log(productCollection);
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
         productName: req.body.productName,
      });
      if (!existingProduct) {
        await productCollection.insertMany([
          {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage1: req.files[0].filename,
            productImage2: req.files[1].filename,
            productImage3: req.files[2].filename,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        ]);
        // console.log(req.files[0].filename);
        res.redirect("/admin/products");
      } else {
        console.log("addpro out")
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/addproduct");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const editProductpage = async (req, res) => {
    try {
      console.log("editpage");
      const productId = req.params.id;
      console.log(productId);
      const productData = await productCollection.findOne({_id:productId}); 
      const categories = await categoryCollection.find({ })
      console.log(categories);
      res.render("admin/editproduct.ejs", {
        productData,categories
        // productExists: req.session.productAlreadyExists,
      });
    } catch (error) {
      console.error( error);
    }
  };

const deleteProduct = async (req,res)=>{
   try{
      await productCollection.findOneAndDelete({ _id: req.params.id });
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  }



  const unListProduct = async (req, res) => {
    try {
      console.log("hajaak")
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  };


  
  const listProduct = async (req, res) => {
    try {
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  };

  const editProduct = async (req, res) => {
    console.log("edit");
    try {
      console.log(req.body.productName)
      let existingProduct = await productCollection.find({
        productName: req.body.productName
      });
      console.log(existingProduct);
      console.log(req.params.id)
      if (existingProduct.length == 0 || (existingProduct[0]._id == req.params.id && existingProduct.length ==1)) {
        console.log("edit1");
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        };
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].filename;
        }
        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].filename;
        }
        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].filename;
        }
        await productCollection.findOneAndUpdate(
          { _id: req.params.id },
          updateFields
        );
        console.log("edit3");
        res.redirect("/admin/products");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/products");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const search = async (req, res) => {
    try {

      console.log(req.body);
      const searchQuery  = req.body.search // Adjust according to the name attribute of your form input
      console.log(searchQuery)
      const searchProduct = await productCollection.find({
        $or: [
          { productName: { $regex: searchQuery, $options: "i" } },
          { parentCategory: { $regex: searchQuery, $options: "i" } },
        ],    
      }) 

      req.session.shopProductData = searchProduct;
      res.redirect("back");
    } catch (error) {
      console.log(error);
    }
  };


  
  module.exports = 
  {
    addProduct,
    addProductPage,
    productlist,
    editProductpage,
    editProduct,
    unListProduct,
    listProduct,
    deleteProduct,
    search,


    
  // //    user product process fn below

   productCategoryfn :async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = 8;
      let skip = (page - 1) * limit;
      let productData =
        req.session?.shopProductData?.slice(skip, limit*page )
         ||
        (await productCollection
          .find({ isListed: true })
          .skip(skip)
          .limit(limit));
      if (req.session.user) {
        cartData = await cartCollection
          .find({ userId: req.session?.currentUser?._id })
          .populate("productId");
      } else {
        cartData = [];
      }
      let categoryData = await categoryCollection.find({ isListed: true });
      let count;
      if (req.session && req.session.shopProductData) {
        count = req.session.shopProductData.length;
      } else {
        count = await productCollection.countDocuments({ isListed: true });
      }
      let totalPages = Math.ceil(count / limit);
      let totalPagesArray = new Array(totalPages).fill(null);
      console.log(req.session.button);
      res.render("user/productsCategory", {
        categoryData,
        productData,
        currentUser: req.session.currentUser,
        user: req.session.user,
        count,
        limit,
        totalPagesArray,
        currentPage: page,
        selectedFilter: req.session.button,
        cartData,
      });
    } catch (error) {
      console.error("Error fetching product data:", error);
      res.status(500).send("Internal Server Error");
    }
  },

      ProductDetailsfn : async (req, res) => {
    try {
      const currentProduct = await productCollection.findOne({
        _id: req.params.id,
      });
      res.render("user/ProductDetails", {
        user: req.session.user, 
        currentProduct,
      });
    } catch (error) { }
  },

       sortPriceAscending: async (req, res) => {
  
   try {
    req.session?.shopProductData?.sort( (a,b)=>b.productPrice-a.productPrice  ) || await productCollection
     .find({ isListed: true })
     .sort({ productPrice: 1 });
      res.json({ success: true });
      } catch (error) {
    console.error(error);
    }
    },
  
    
     sortPriceDescending: async (req, res) => {
     try {
    req.session?.shopProductData?.sort( (a,b)=>a.productPrice-b.productPrice  ) || await productCollection
     .find({ isListed: true })
    .sort({ productPrice: -1 });
     res.json({ success: true });
     } catch (error) {
     console.error(error);
  }
},
}