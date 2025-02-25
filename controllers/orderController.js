  import Order from "../models/orderModel.js";
  import Product from "../models/productModel.js";
  import nodemailer from "nodemailer";

  // Utility Function
  function calcPrices(orderItems) {
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const totalPrice = itemsPrice.toFixed(2); 

    return {
      itemsPrice: totalPrice,
      totalPrice,
    };
  }

  const createOrder = async (req, res) => {
    try {
      console.log("Order request body:", req.body);
      console.log("User ID:", req.user ? req.user._id : "User not authenticated");
  
      const { orderItems, shippingAddress, paymentMethod } = req.body;
  
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
  
      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ error: "No order items" });
      }
  
      const itemsFromDB = await Product.find({
        _id: { $in: orderItems.map((x) => x._id) }, 
      });
  
      const dbOrderItems = orderItems.map((itemFromClient) => {
        const matchingItemFromDB = itemsFromDB.find(
          (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
        );
  
        if (!matchingItemFromDB) {
          throw new Error(`Product not found: ${itemFromClient.product}`);
        }
  
        return {
          ...itemFromClient,
          price: matchingItemFromDB.price,
          serialnumber: matchingItemFromDB.serialnumber,
        };
      });
  
      const { itemsPrice, totalPrice } = calcPrices(dbOrderItems);
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const userEmail = req.user.email; 
      const brandName = req.body.orderItems[0].brand; 
      const orderDate = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }); 
      
      const mailOptions = {
        from: userEmail,
        to: [userEmail, "karimemad2066@gmail.com"], 
        subject: "New Order Confirmation",
        text: `
        🎉 Hi Dear,
      
        Your order has been successfully placed. Here are the details:
      
        📅 Order Date & Time: ${orderDate}  
        💰 Order Total: ${req.body.totalPrice} EGP  
        👤 Customer ID: ${req.user._id}  
        ✉️ Customer Email: ${userEmail}  
        🏷️ Brand: ${brandName}  
      
        📦 Order Information:  
        🔢 Serial Number: ${req.body.shippingAddress.address}  
        📛 Product Name: ${req.body.shippingAddress.city}  
        🧑‍💼 Salesman: ${req.body.shippingAddress.country}  
      
        🚀 Thank you for choosing us!  
        Best regards,  
        Your Company Name
        `,
      };
      
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
  
      const order = new Order({
        orderItems: dbOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        totalPrice,
      });
  
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
 
  const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find({}).populate("user", "id username");
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getUserOrders = async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const countTotalOrders = async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments();
      res.json({ totalOrders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const calculateTotalSales = async (req, res) => {
    try {
      const orders = await Order.find();
      const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      res.json({ totalSales });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const calcualteTotalSalesByDate = async (req, res) => {
    try {
      const salesByDate = await Order.aggregate([
        {
          $match: {
            isPaid: true,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
            },
            totalSales: { $sum: "$totalPrice" },
          },
        },
      ]);

      res.json(salesByDate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findOrderById = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate(
        "user",
        "username email"
      );

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order not found");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const markOrderAsPaid = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.payer.email_address,
        };

        const updateOrder = await order.save();
        res.status(200).json(updateOrder);
      } else {
        res.status(404);
        throw new Error("Order not found");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const markOrderAsDelivered = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        res.status(404);
        throw new Error("Order not found");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const deleteOrder = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      await order.deleteOne(); 
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteAllOrders = async (req, res) => {
    try {
      await Order.deleteMany({}); 
      res.status(200).json({ message: "All orders deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  export {
    createOrder,
    getAllOrders,
    getUserOrders,
    countTotalOrders,
    calculateTotalSales,
    calcualteTotalSalesByDate,
    findOrderById,
    markOrderAsPaid,
    markOrderAsDelivered,
    deleteOrder,
    deleteAllOrders,
  };
