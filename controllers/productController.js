import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, serialnumber, price, category, quantity} = req.fields; 

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !serialnumber:
        return res.json({ error: "serialnumber is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = new Product({ ...req.fields });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const { name, serialnumber, price, category, quantity } = req.fields; 

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !serialnumber:
        return res.json({ error: "serial number is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.fields },
      { new: true }
    );

    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



const fetchProducts = asyncHandler(async (req, res) => {
  try {
    
    const pageSize = 6;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await Product.countDocuments({
      ...keyword,
      distributor: req.user._id, 
    });

    const products = await Product.find({
      ...keyword,
      distributor: req.user._id,
    })
      .limit(pageSize)
      .skip(pageSize * (page - 1)); 

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page < Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
});



const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .limit(12)
      .sort({ createAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(args);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// const updateBrandBySerialNumber = asyncHandler(async (req, res) => {
//   try {


//     const { serialnumber, brand } = req.body;

//     if (!serialnumber) {
//       return res.status(400).json({ error: "Serial number is required" });
//     }
//     if (!brand) {
//       return res.status(400).json({ error: "Brand is required" });
//     }

//     const product = await Product.findOne({ serialnumber });
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
    
//     product.brand = brand;
//     await product.save();
//     console.log(req.body);
//     res.json({ message: "Brand updated successfully", product });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

const updateBrandBySerialNumber = asyncHandler(async (req, res) => {
  try {
    const { serialnumber, brand } = req.body;

    if (!serialnumber) {
      return res.status(400).json({ error: "Serial number is required" });
    }
    if (!brand) {
      return res.status(400).json({ error: "Brand is required" });
    }

    const product = await Product.findOne({ serialnumber });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.brand = brand;
    product.distributor = req.user._id; // ربط المنتج بالموزع الحالي
    await product.save();

    res.json({ message: "Brand updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
  updateBrandBySerialNumber,
};
