import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, serialnumber, price, category, quantity} = req.fields; 

    // Validation
    switch (true) {
      case !name:
        return res.json({ error: "الاسم مطلوب" });
      case !serialnumber:
        return res.json({ error: "الرقم السيريال مطلوب" });
      case !price:
        return res.json({ error: "السعر مطلوب" });
      case !category:
        return res.json({ error: "الكاتيجرى مطلوب" });
      case !quantity:
        return res.json({ error: "الكمية المطلوبة" });
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
        return res.json({ error: "الاسم مطلوب" });
      case !serialnumber:
        return res.json({ error: "الرقم السيريال مطلوب" });
      case !price:
        return res.json({ error: "السعر مطلوب" });
      case !category:
        return res.json({ error: "الكاتيجرى مطلوب" });
      case !quantity:
        return res.json({ error: "الكمية المطلوبة" });
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
    res.status(500).json({ error: "خطأ من الخادم" });
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
      throw new Error("لم يتم العثور على المنتج");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "لم يتم العثور على المنتج" });
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


const updateBrandBySerialNumber = asyncHandler(async (req, res) => {
  try {
    const { serialnumber, brand } = req.body;

    if (!serialnumber) {
      return res.status(400).json({ error: "رقم السيريال مطلوب" });
    }
    if (!brand) {
      return res.status(400).json({ error: "البراند مطلوب" });
    }

    const product = await Product.findOne({ serialnumber });

    if (!product) {
      return res.status(404).json({ error: "لم يتم العثور على المنتج" });
    }

    product.brand = brand;
    product.distributor = req.user._id; 
    await product.save();

    res.json({ message: "تم اضافة المنتج و البراند بنجاح", product });
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
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
  updateBrandBySerialNumber,
};
