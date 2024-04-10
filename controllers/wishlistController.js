const wishListCollection = require("../Model/WishlistModel")
// const wishlistpage = (req,res)=>{
// res.render("user/Wishlist")
// }


const wishlistpage = async (req, res) => {
    try {
        const products = await wishListCollection
      .find({ userId: req.session.userInfo._id})
      .populate("productId");
    
        res.render("user/Wishlist", {
          products
        });
        console.log(req.session.userInfo);
      } catch (error) {
        console.error("Error in cart:", error);
      }
};

const addToWishlistController = async (req, res) => {
    try {
        let existingProduct = await wishListCollection.findOne({
          userId: req.session.userInfo._id,
          productId: req.params.id,
        });
    
        if (existingProduct) {
          await wishListCollection.updateOne(
            { _id: existingProduct._id },
            { $inc: { productQuantity: 1 } }
          );
        } else {
          await wishListCollection.create({
            userId: req.session.userInfo._id,
            productId: req.params.id,
            currentUser: req.session.userInfo,
            user: req.body.user,
          });
        }
        res.redirect("/wishlist");
      } catch (error) {
        console.log(error);
      }
};

const removeFromWishList = async (req, res) => {
    try {
      await wishListCollection.findOneAndDelete({ _id: req.params.id });
      res.send("hello ur cart is deleted");
    } catch (error) {
      console.error(error);
    }
  };

module.exports = {wishlistpage,addToWishlistController,removeFromWishList}