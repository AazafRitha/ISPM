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
    const { title, type, description, url, body, tags = [], bannerImage = "" } = req.body || {};
    if(!title || !type) return res.status(400).json({ error: "title and type are required" });
    if((type==="youtube" || type==="pdf") && !url) return res.status(400).json({ error: "url is required" });
    if((type==="blog" || type==="writeup") && !body) return res.status(400).json({ error: "body is required" });
    const item = await EduContent.create({
      title, type,
      description: (description||""),
      url: (url||""),
      body: (body||""),
      tags,
      bannerImage: bannerImage || "",
      status: "draft", publishedAt: null
    });
    res.status(201).json(item);
  }catch(e){ console.error(e); res.status(500).json({ error: "Create failed" }); }
}

export async function updateContent(req, res){
  try{
    const item = await EduContent.findById(req.params.id);
    if(!item) return res.status(404).json({ error: "Not found" });
    const fields = ["title","type","description","url","body","tags","status","bannerImage"];
    for(const k of fields){ if (k in req.body) item[k] = req.body[k]; }
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
    // In a real app, you would handle file upload here
    // For now, return a mock URL
    const mockImageUrl = 'https://via.placeholder.com/400x300?text=Uploaded+Image';
    
    res.json({
      url: mockImageUrl,
      filename: 'uploaded-image.jpg'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const uploadPdf = async (req, res) => {
  try {
    // In a real app, you would handle file upload here
    // For now, return a mock URL
    const mockPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    res.json({
      url: mockPdfUrl,
      filename: 'uploaded-document.pdf'
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
};
