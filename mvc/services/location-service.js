const Location = require("../models/location-model");

//SERVICES
const createLocation = async (city, longitude, latitude) => {
  const location = new Location({
    city: city,
    longitude: longitude,
    latitude: latitude,
  });

  return await location.save();
};

const getLocations = async () => {
  return await Location.find();
};

const getLocationById = async (id) => {
  return await Location.find(id);
};

const updateLocation = async (id, city, longitude, latitude) => {
  const location = await getLocationById(id);
  if (!location) return null;

  location.city = city;
  location.longitude = longitude;
  location.latitude = latitude;
  await location.save();
  return location;
};

const deleteLocation = async (id) => {
  const Location = await getLocationById(id);
  if (!Location) return null;

  await Location.remove();
  return Location;
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
