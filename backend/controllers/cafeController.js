const Cafe = require('../models/Cafe');
const asyncHandler = require('../middleware/asyncHandler');
const geocode = require('../utils/geocode');

// Helper to throw an error with a status code
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// 1) POST /api/cafes — create a cafe
exports.createCafe = asyncHandler(async (req, res) => {
  const { name, city } = req.body;

  // Manual required-field check (Mongoose also validates)
  if (!name || !city) {
    throw httpError(400, 'name and city are required');
  }

  // Auto map pin when the client didn't send one
  if (!req.body.location?.lat || !req.body.location?.lng) {
    const pin = await geocode(req.body.area, city);
    if (pin) req.body.location = pin;
  }

  const cafe = await Cafe.create(req.body);
  res.status(201).json({ success: true, data: cafe });
});

// 2) GET /api/cafes?city=&tag=&minRating= — list (excludes soft-deleted)
exports.getCafes = asyncHandler(async (req, res) => {
  const { city, tag, minRating } = req.query;

  // Always hide soft-deleted docs
  const filter = { isDeleted: false };

  if (city) {
    // Case-insensitive exact match on city
    filter.city = new RegExp(`^${city}$`, 'i');
  }
  if (tag) {
    // Match one value inside the ambienceTags array
    filter.ambienceTags = tag;
  }
  if (minRating !== undefined && minRating !== '') {
    filter.rating = { $gte: Number(minRating) };
  }

  const cafes = await Cafe.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: cafes });
});

// 3) GET /api/cafes/:id — single cafe
exports.getCafeById = asyncHandler(async (req, res) => {
  const cafe = await Cafe.findOne({ _id: req.params.id, isDeleted: false });
  if (!cafe) {
    throw httpError(404, 'Cafe not found');
  }
  res.json({ success: true, data: cafe });
});

// 4) PUT /api/cafes/:id — update fields
exports.updateCafe = asyncHandler(async (req, res) => {
  // Backfill the map pin when neither the update nor the saved doc has one
  if (!req.body.location?.lat || !req.body.location?.lng) {
    const existing = await Cafe.findOne(
      { _id: req.params.id, isDeleted: false },
      { area: 1, city: 1, 'location.lat': 1 }
    );
    if (existing && !existing.location?.lat) {
      const pin = await geocode(req.body.area ?? existing.area, req.body.city ?? existing.city);
      if (pin) req.body.location = pin;
    }
  }
  const cafe = await Cafe.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true } // return updated doc + run schema validation
  );
  if (!cafe) {
    throw httpError(404, 'Cafe not found');
  }
  res.json({ success: true, data: cafe });
});

// 5) DELETE /api/cafes/:id — soft delete
exports.deleteCafe = asyncHandler(async (req, res) => {
  const cafe = await Cafe.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!cafe) {
    throw httpError(404, 'Cafe not found');
  }
  res.json({ success: true, data: null });
});
