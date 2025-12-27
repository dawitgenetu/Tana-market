import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    default: 'chapa'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  // Refund workflow
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundReason: String,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected', 'refunded'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  chapaTransactionId: String,
  chapaReference: String
}, {
  timestamps: true
});

// Generate TANA tracking number before shipping
orderSchema.methods.generateTrackingNumber = function() {
  const date = new Date();
  // Format date as YYYYMMDD
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`; // YYYYMMDD
  // 4-digit random number
  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `TANA-${dateStr}-${randomNum}`;
};

export default mongoose.model('Order', orderSchema);

