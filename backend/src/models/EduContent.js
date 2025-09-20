// Author: Aazaf Ritha
import mongoose from "mongoose";

const EduContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["youtube", "pdf", "blog", "writeup"], required: true },
  description: { type: String, default: "" },
  url: { type: String, default: "" },        // youtube/pdf link
  body: { type: String, default: "" },       // blog/writeup (markdown or plain)
  tags: { type: [String], default: [] },
  bannerImage: { type: String, default: "" },// NEW: banner image URL
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("EduContent", EduContentSchema);
