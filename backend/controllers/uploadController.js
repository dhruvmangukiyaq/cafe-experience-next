const multer = require('multer');
const Attachment = require('../models/Attachment');
const Cafe = require('../models/Cafe');
const asyncHandler = require('../middleware/asyncHandler');

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Photos, docs, pdfs, spreadsheets, text — the everyday cafe-journal set
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);

// Per-type size caps: documents max 5MB, photos max 10MB
// (multer's hard cap below stays 10MB for everything).
const DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);
const DOC_LIMIT = 5 * 1024 * 1024;

// Memory storage: file never touches disk (Vercel-safe), goes straight to Atlas
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB per file, max 10 per request
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(httpError(400, `File type not allowed: ${file.originalname} (${file.mimetype})`));
  },
});

exports.uploadMiddleware = upload.array('files', 10);

// POST /api/uploads — body: multipart { files[], cafeId } (login required)
exports.uploadFiles = asyncHandler(async (req, res) => {
  const { cafeId } = req.body;
  if (!cafeId) throw httpError(400, 'cafeId is required');

  const cafe = await Cafe.findOne({ _id: cafeId, isDeleted: false });
  if (!cafe) throw httpError(404, 'Cafe not found');
  if (!req.files || !req.files.length) throw httpError(400, 'No files received');

  // Documents (pdf/doc/excel/…) cap at 5MB; photos cap at multer's 10MB
  const tooBig = req.files.filter((f) => DOC_TYPES.has(f.mimetype) && f.size > DOC_LIMIT);
  if (tooBig.length) {
    const names = tooBig.map((f) => f.originalname).join(', ');
    throw httpError(400, `PDF / Word / Excel files must be under 5MB: ${names}`);
  }

  const docs = await Attachment.insertMany(
    req.files.map((f) => ({
      cafe: cafeId,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      data: f.buffer,
    }))
  );

  res.status(201).json({ success: true, data: docs });
});

// GET /api/uploads?cafeId=… — metadata list only (binary excluded)
exports.listFiles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.cafeId) filter.cafe = req.query.cafeId;
  const files = await Attachment.find(filter).select('-data').sort({ createdAt: -1 });
  res.json({ success: true, data: files });
});

// GET /api/uploads/:id — stream the file.
// ?download=1 forces "Save as", otherwise images/pdfs open in the browser.
exports.getFile = asyncHandler(async (req, res) => {
  const file = await Attachment.findById(req.params.id);
  if (!file) throw httpError(404, 'File not found');

  const inlineTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
  const disposition =
    req.query.download === '1' || !inlineTypes.has(file.mimetype) ? 'attachment' : 'inline';

  res.set({
    'Content-Type': file.mimetype,
    'Content-Length': file.size,
    'Content-Disposition': `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
  });
  res.send(file.data);
});

// DELETE /api/uploads/:id (login required)
exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await Attachment.findByIdAndDelete(req.params.id);
  if (!file) throw httpError(404, 'File not found');
  res.json({ success: true, data: null });
});
