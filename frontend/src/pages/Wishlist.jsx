import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, Heart } from "lucide-react";
import { addToCartAsync, addToCartLocal } from "../redux/cartSlice";
import { removeFromWishlist } from "../redux/wishlistSlice";

const BASE_URL = "http://localhost:5000";

const getProductImageUrl = (product) => {
  let imagePath = product.image || product.images?.[0] || "";

  if (!imagePath) return "https://via.placeholder.com/400";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const Wishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const user = useSelector((state) => state.auth.user);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    if (!user) {
      dispatch(addToCartLocal({ product, quantity: 1 }));
      return;
    }
    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }));
  };

  return (
    <div className="bg-secondary/20 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Your Wishlist</h1>
            <p className="text-gray-500 mt-2">
              Save products for later and move them to cart when you're ready.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Heart size={20} className="text-red-500" />
            <span>
              {wishlistItems.length} item{wishlistItems.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center">
            <Heart size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add products to your wishlist and come back later to review them.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product, index) => (
              <div
                key={product._id || product.id || index}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 mt-2">${product.price}</p>
                  </div>
                  <div className="mt-auto space-y-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-all"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product._id || product.id)}
                      className="w-full py-3 border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
