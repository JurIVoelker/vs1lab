// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const {parse} = require("nodemon/lib/cli");

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {

  let tags = GeoTagStore.getGeoTags(1);
  console.log(tags[0][0]);
  res.render('index', { taglist: (tags[0]).slice(0,6), lat: "", long: "", pagination : tags[1]});
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  try { // schauen ob Daten als Queryparameter übergeben wurden
    let data = JSON.parse(req.query.q);
    let latitude = data.latitude;
    let longitude = data.longitude;
    let searchterm = data.searchterm;

    // Hashtag wird wieder hinzugefügt
    if (data.hashtag === true){
      searchterm = "#"+searchterm;
    }

    if (searchterm === ""){ // Falls kein Suchparameter übergeben wurde, werden alle Geotags in der Nähe angezeigt
      res.json({
        "taglist": GeoTagStore.getNearbyGeoTags(latitude,longitude, 600)[0]
      });
    } else {
      res.json({
        "taglist": GeoTagStore.searchNearbyGeoTags(latitude, longitude, 600, searchterm)[0]
      });
    }

  } catch (e) { // Falls keine Daten übergeben wurden, dann werden alle Geotags ausgegeben
    res.json({
      "taglist": GeoTagStore.getGeoTags()[0]
    });
  }

});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
  // Daten aus dem Body auslesen
  let lat = req.body.latitude;
  let long = req.body.longitude;
  let name = req.body.name;
  let hashtag = req.body.hashtag;

  // Tag dem speicher hinzufügen und Daten übermitteln
  let tag = GeoTagStore.addGeoTag(lat,long,name,hashtag);
  res.json({
    "taglist": GeoTagStore.getNearbyGeoTags(lat, long, 600)[0]
  });
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {

  res.json({
    "taglist": [GeoTagStore.getGeoTag(req.params["id"])]
  });
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put('/api/geotags/:id', (req, res) => {

  let lat = req.body.latitude;
  let long = req.body.longitude;
  let name = req.body.name;
  let hashtag = req.body.hashtag;

  res.json({
    "taglist": [GeoTagStore.setGeoTag(lat,long,name,hashtag,req.params["id"])]
  });
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  res.json({
    "taglist": [GeoTagStore.deleteGeoTag(req.params["id"])]
  });
});

router.get('/api/geotags/pagination/:page', (req, res) => {

  let page = req.params["page"];
  try { // schauen ob Daten als Queryparameter übergeben wurden
    let data = JSON.parse(req.query.q);
    let latitude = data.latitude;
    let longitude = data.longitude;
    let searchterm = data.searchterm;

    // Hashtag wird wieder hinzugefügt
    if (data.hashtag === true){
      searchterm = "#"+searchterm;
    }

    if (searchterm === ""){ // Falls kein Suchparameter übergeben wurde, werden alle Geotags in der Nähe angezeigt
      let tags = GeoTagStore.getNearbyGeoTags(latitude,longitude, 600, page);
      res.json({
        "taglist": tags[0],
        "pagination": tags[1]
      });
    } else {
      let tags = GeoTagStore.searchNearbyGeoTags(latitude, longitude, 600, searchterm, page);
      res.json({
        "taglist": tags[0],
        "pagination": tags[1]
      });
    }

  } catch (e) { // Falls keine Daten übergeben wurden, dann werden alle Geotags ausgegeben
    let tags = GeoTagStore.getGeoTags(page);
    res.json({
      "taglist": tags[0],
      "pagination": tags[1]
    });
  }
});

router.post('/api/geotags/pagination/', (req, res) => {
  // Daten aus dem Body auslesen
  let lat = req.body.latitude;
  let long = req.body.longitude;
  let name = req.body.name;
  let hashtag = req.body.hashtag;

  // Tag dem speicher hinzufügen und Daten übermitteln
  let tag = GeoTagStore.addGeoTag(lat,long,name,hashtag);
  res.json({
    "taglist": GeoTagStore.getNearbyGeoTags(lat, long, 600)[0],
    "pagination": GeoTagStore.getNearbyGeoTags(lat, long, 600)[1]
  })
});

module.exports = router;
