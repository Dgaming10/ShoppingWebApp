const locationService = require("../services/location-service");

const createLocation = async (req, res) => {
  if (!req.body.city) {
    res.status(400).json({
      message: "city name is required",
    });
  }
  if (req.body.latitude < 0 || req.body.longitude < 0) {
    res.status(400).json({
      message: "location parameter cannot be negative",
    });
  }
  const newLocation = await locationService.createLocation(
    req.body.city,
    req.body.longitude,
    req.body.latitude
  );
  res.json(newLocation);
};

const getLocations = async (req, res) => {
  const Locations = await locationService.getLocations();
  res.json(Locations);
};

const updateLocation = async (req, res) => {
  const Location = await locationService.updateLocation(
    req.params.id,
    req.body.city,
    req.body.longitude,
    req.body.latitude
  );
  if (!Location) {
    return res.status(404).json({ errors: ["Location not found"] });
  }
  res.json(Location);
};

const deleteLoction = async (req, res) => {
  const location = await locationService.deleteLocation(req.params.id);
  if (!location) {
    return res.status(404).json({ errors: ["location not found"] });
  }

  res.send();
};

module.exports = {
  createLocation,
  getLocations,
  updateLocation,
  deleteLoction,
};
