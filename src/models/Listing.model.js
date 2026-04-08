import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., 'electronics', 'furniture'
    images: [{ type: String }], // Array of image URLs
    location: { type: String, default: "Bahir Dar" },
    condition: { type: String, enum: ['new', 'slightly used', 'used'], default: 'used' },
    
    // For the Ranking Algorithm
    likesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isSold: { type: Boolean, default: false },
    rankingScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;