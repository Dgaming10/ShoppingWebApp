const { Router } = require("express");
const locationRouter = Router();
const locationController = require("../controllers/location-controller");
const statusMSG = require("../../public/json/status-messages.json");

locationRouter.get("/getlocations", locationController.getLocations);

locationRouter.post(
  "/createlocation",
  function (req, res, next) {
    if (req.session && req.session.isAdmin) {
      next();
    }
  },
  locationController.createLocation
);

module.exports = locationRouter;
