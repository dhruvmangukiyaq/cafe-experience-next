const mongoose = require('mongoose');

// File uploaded against a cafe (photo, pdf, doc, excel…).
// The binary lives right here in Atlas as a Buffer (16MB doc limit;
// uploads are capped at 10MB per file in the route).
const attachmentSchema = new mongoose.Schema(
  {
    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cafe',
      required: [true, 'Cafe id is required'],
    },
    originalName: { type: String, required: true, trim: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

// Never leak the binary in list queries by default
attachmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.data;
  return obj;
};

module.exports = mongoose.model('Attachment', attachmentSchema);
