const Document = require('../models/document');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { projectId, category, description, isPublic } = req.body;

    const document = await Document.create({
      projectId,
      uploadedBy: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      fileType: getFileType(req.file.mimetype),
      category: category || 'OTHER',
      description,
      isPublic: isPublic === 'true'
    });

    res.status(201).json({ message: 'Document uploaded', document });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload document', error: err.message });
  }
};

const getProjectDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, fileType } = req.query;

    const filter = { projectId };
    if (category) filter.category = category;
    if (fileType) filter.fileType = fileType;

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ documents });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    document.downloadCount += 1;
    await document.save();

    res.download(document.filePath, document.originalName);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download document', error: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only uploader can delete document' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete document', error: err.message });
  }
};

function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'DOCUMENT';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'ARCHIVE';
  return 'OTHER';
}

module.exports = {
  uploadDocument,
  getProjectDocuments,
  downloadDocument,
  deleteDocument
};
