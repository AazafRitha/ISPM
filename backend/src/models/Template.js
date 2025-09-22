import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
}, { timestamps: true });

const Template = mongoose.model("Template", TemplateSchema);
export default Template;
