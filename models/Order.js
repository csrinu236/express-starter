const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    disc: {
      type: Number,
      default: 0, // discount percentage or amount (your choice)
      min: 0,
      max: 100,
      required: true,
    },
    discPrice: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
); // Prevents automatic _id generation for each product

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      trim: true,
      required: [true, 'Please provide customer name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
      set: (v) => {
        if (!v) return v;
        return v
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      },
    },
    customerPhoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    petName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters'],
      set: (v) => {
        if (!v) return v;
        return v
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      },
    },
    petBreed: {
      type: String,
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters'],
      set: (v) => {
        if (!v) return v;
        return v
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      },
    },
    petGender: {
      type: String,
      enum: [
        {
          values: ['Male', 'Female', '-'],
          message:
            '{VALUE} is not supported. Gender must be Male or Female or -',
        },
      ],
      set: (v) => {
        if (!v) return v;
        return v
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      },
    },
    amountPaid: {
      type: Number,
      required: [true, 'Please provide amount paid'],
      default: 0,
    },
    productsBought: {
      type: [productSchema],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one orderItem must be added.',
      },
    },
    orderedDate: {
      type: Date,
      required: [true, 'Please provide Date'],
    },
  },
  { timestamps: true }
);

const OrdersCollection = mongoose.model('Orders-Collection', OrderSchema);
module.exports = OrdersCollection;
