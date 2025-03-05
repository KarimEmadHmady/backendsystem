import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: false },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    serialnumber: { type: String, required: true , unique: true  },
    distributor: { type: ObjectId, ref: "User", required: false }, 
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
