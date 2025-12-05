import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import OrderData from '../models/order.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AddressModel from '../models/address.js'
import ProductModal from '../models/product.js'
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



//Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    
    console.log("Creating order for items:", items);

    res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

// ✅ Verify Order

export const verifyOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      amount,
      Quantity,
      delivery_address,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartData,
    } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!razorpay_order_id || !delivery_address || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details or delivery address' });
    }

    if (!mongoose.Types.ObjectId.isValid(delivery_address)) {
      return res.status(400).json({ error: 'Invalid delivery address format' });
    }

    const addressExists = await AddressModel.findById(delivery_address);
    if (!addressExists) {
      return res.status(404).json({ error: 'Delivery address not found' });
    }

    if (!Array.isArray(cartData) || cartData.length === 0) {
      return res.status(400).json({ error: 'Cart data is required and must be an array' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature, payment verification failed' });
    }

    // Build order items from cartData
    const orderItems = await Promise.all(
      cartData.map(async (item) => {
        const p = await ProductModal.findById(item.productId).lean();
        const price = p?.price ?? 0;
        const oldPrice = p?.oldPrice ?? 0;
        const qty = Number(item.quantity || 0);
        return {
          productId: item.productId,
          name: p?.name || '',
          image: Array.isArray(p?.images) && p.images.length ? p.images[0] : '',
          price,
          oldPrice,
          quantity: qty,
          subtotal: price * qty,
        };
      })
    );

    const computedTotalQty = orderItems.reduce((s, it) => s + (it.quantity || 0), 0);
    const computedSubtotal = orderItems.reduce((s, it) => s + (it.subtotal || 0), 0);

    const orderData = new OrderData({
      userId,
      Quantity: Quantity || computedTotalQty,
      delivery_address,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: 'success',
      subTotalAmt: amount || computedSubtotal,
      productId: cartData[0]?.productId, // legacy for compatibility
      orderItems,
      invoice_receipt: razorpay_signature,
    });

    await orderData.save();

    res.status(200).json({ message: 'Payment verified and order saved successfully!' });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    res.status(500).json({ error: 'Failed to verify Razorpay payment' });
  }
};


export const getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User is invalid", success: false, error: true });
    }

    const orders = await OrderData.find({ userId })
      .populate('productId')
      .populate('userId')
      .populate('delivery_address')
      .populate('orderItems.productId')


    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Orders not found", success: false, error: true });
    }

    

    return res.status(200).json({
      message: "Your orders are fetch",
      data: orders,
      success: true,
      error: false,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};

export const getAllOrder =async(req,res)=>{
  try {
    const orders = await OrderData.find()
      .populate('userId')
      .populate('productId')
      .populate('delivery_address')
      .populate('orderItems.productId');
    if (!orders) {
      return res.status(400).send({message:"Order is not availible",success:false,error:true})
    }
    
    res.status(200).send({message:"Order is fetched",data:orders,success:true,error:false})
    
  } catch (error) {
    return res.status(400).send({message : "Error occur"+error,success:false,error:true})
  }
}
