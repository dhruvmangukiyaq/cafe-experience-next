const Cafe = require('../models/Cafe');

const cafeController = {
  // Create a new cafe
  createCafe: async (req, res) => {
    try {
      const { name, city, area, foodSpecialties, environment, avgPricePerPerson, 
              wifiQuality, powerPlugsAvailable, ambienceTags, rating, notes } = req.body;

      if (!name || !city) {
        return res.status(400).json({
          success: false,
          message: 'Name and city are required'
        });
      }

      const cafe = await Cafe.create({
        name,
        city,
        area,
        foodSpecialties: foodSpecialties || [],
        environment: environment || {},
        avgPricePerPerson,
        wifiQuality,
        powerPlugsAvailable,
        ambienceTags: ambienceTags || [],
        rating,
        notes
      });

      res.status(201).json({
        success: true,
        data: cafe
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all cafes with filters
  getCafes: async (req, res) => {
    try {
      const { city, tag, minRating } = req.query;
      
      const query = { isDeleted: false };

      if (city) {
        query.city = new RegExp(city, 'i');
      }

      if (tag) {
        query.ambienceTags = { $in: [new RegExp(tag, 'i')] };
      }

      if (minRating) {
        query.rating = { $gte: Number(minRating) };
      }

      const cafes = await Cafe.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: cafes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get single cafe by id
  getCafeById: async (req, res) => {
    try {
      const cafe = await Cafe.findOne({ _id: req.params.id, isDeleted: false });

      if (!cafe) {
        return res.status(404).json({
          success: false,
          message: 'Cafe not found'
        });
      }

      res.json({
        success: true,
        data: cafe
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update cafe
  updateCafe: async (req, res) => {
    try {
      const { name, city, area, foodSpecialties, environment, avgPricePerPerson,
              wifiQuality, powerPlugsAvailable, ambienceTags, rating, notes } = req.body;

      const cafe = await Cafe.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        {
          name,
          city,
          area,
          foodSpecialties,
          environment,
          avgPricePerPerson,
          wifiQuality,
          powerPlugsAvailable,
          ambienceTags,
          rating,
          notes
        },
        { new: true, runValidators: true }
      );

      if (!cafe) {
        return res.status(404).json({
          success: false,
          message: 'Cafe not found'
        });
      }

      res.json({
        success: true,
        data: cafe
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Soft delete cafe
  deleteCafe: async (req, res) => {
    try {
      const cafe = await Cafe.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      if (!cafe) {
        return res.status(404).json({
          success: false,
          message: 'Cafe not found'
        });
      }

      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = cafeController;