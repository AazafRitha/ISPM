// Author: Aazaf Ritha
import EduContent from "../models/EduContent.js";

// List with filters: ?status=&q=&type=
export async function listContents(req, res){
  try{
    const { status, q, type } = req.query || {};
    const cond = {};
    if (status) cond.status = status;
    if (type) cond.type = type;
    if (q) cond.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $elemMatch: { $regex: q, $options: "i" } } },
    ];
    const items = await EduContent.find(cond).sort({ createdAt: -1 }).lean();
    res.json(items);
  }catch(e){ console.error(e); res.status(500).json({ error: "Failed to list" }); }
}

export async function getContent(req, res){
  try{
    const item = await EduContent.findById(req.params.id).lean();
    if(!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Failed to load" }); }
}

export async function createContent(req, res){
  try{
    const { title, type, description, url, body, tags = [], bannerImage = "", posterImage = "", topic = "" } = req.body || {};
    // For draft creation, only require minimal fields so users can save incomplete drafts
    if(!title || !type) return res.status(400).json({ error: "title and type are required" });
    const item = await EduContent.create({
      title, type,
      description: (description||""),
      url: (url||""),
      body: (body||""),
      tags,
      bannerImage: bannerImage || "",
      posterImage: posterImage || "",
      topic: topic || "",
      status: "draft", publishedAt: null
    });
    res.status(201).json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Create failed" }); }
}

export async function updateContent(req, res){
  try{
    const item = await EduContent.findById(req.params.id);
    if(!item) return res.status(404).json({ error: "Not found" });
    const fields = ["title","type","description","url","body","tags","status","bannerImage","posterImage","topic"];
    for(const k of fields){ if (k in req.body) item[k] = req.body[k]; }
    // Allow saving drafts freely; strict checks happen during publish
    if(!item.title || !item.type) return res.status(400).json({ error: "title and type are required" });
    await item.save();
    res.json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Update failed" }); }
}

export async function deleteContent(req, res){
  try{
    const item = await EduContent.findByIdAndDelete(req.params.id);
    if(!item) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  }catch(e){ console.error(e); res.status(500).json({ error: "Delete failed" }); }
}

export async function publishContent(req, res){
  try{
    const item = await EduContent.findById(req.params.id);
    if(!item) return res.status(404).json({ error: "Not found" });
    // Enforce required fields by type when publishing
    if(item.type === "youtube" || item.type === "pdf"){
      if(!item.url) return res.status(400).json({ error: "URL is required to publish this content" });
    }
    if(item.type === "blog" || item.type === "writeup"){
      if(!item.body) return res.status(400).json({ error: "Body is required to publish this content" });
    }
    if(item.type === "poster"){
      if(!item.posterImage) return res.status(400).json({ error: "Poster image is required to publish this content" });
    }
    item.status = "published";
    item.publishedAt = new Date();
    await item.save();
    res.json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Publish failed" }); }
}

export async function unpublishContent(req, res){
  try{
    const item = await EduContent.findById(req.params.id);
    if(!item) return res.status(404).json({ error: "Not found" });
    item.status = "draft";
    item.publishedAt = null;
    await item.save();
    res.json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Unpublish failed" }); }
}

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file provided' });
    const publicUrl = `/uploads/content/${file.mimetype === 'application/pdf' ? 'pdfs' : 'images'}/${file.filename}`;
    res.json({ url: publicUrl, filename: file.filename, size: file.size, type: file.mimetype });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const uploadPdf = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF file provided' });
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Only PDF files are allowed' });
    const publicUrl = `/uploads/content/pdfs/${file.filename}`;
    res.json({ url: publicUrl, filename: file.filename, size: file.size, type: file.mimetype });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
};
