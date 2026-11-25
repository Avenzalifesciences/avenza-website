/**
 * Avenza Technologies - Google reviews proxy for client concept pages.
 *
 * Fetches a business's Google rating, review count and (up to 5) reviews from
 * the Places API (New), caches them, and returns JSON to the website. The API
 * key stays in this script's Script Properties (PLACES_API_KEY) and is never
 * sent to the browser. Setup: see REVIEWS-SETUP.md.
 *
 * Usage from a page:  <web app URL>?site=sweet-and-such
 */

// Only these businesses can be looked up, so nobody can use the key for other places.
var SITES = {
  'sweet-and-such': 'Sweet & Such Dessert café, 2101 Main St, Columbia, SC 29201'
};

var CACHE_SECONDS = 6 * 60 * 60;   // Apps Script cache maximum: 6 hours
var FIELDS = 'id,displayName,rating,userRatingCount,googleMapsUri,reviews';

function doGet(e) {
  var site = (e && e.parameter && e.parameter.site) || '';
  if (!SITES[site]) return json_({ ok: false, error: 'unknown site' });

  var cache = CacheService.getScriptCache();
  var cached = cache.get('reviews_' + site);
  if (cached && !(e.parameter && e.parameter.refresh)) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

  try {
    var out = JSON.stringify(fetchReviews_(site));
    cache.put('reviews_' + site, out, CACHE_SECONDS);
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'lookup failed' });
  }
}

function fetchReviews_(site) {
  var key = PropertiesService.getScriptProperties().getProperty('PLACES_API_KEY');
  if (!key) throw new Error('PLACES_API_KEY is not set in Script Properties');

  // The place ID is looked up once and remembered.
  var props = PropertiesService.getScriptProperties();
  var placeId = props.getProperty('PLACE_ID_' + site);
  if (!placeId) {
    var search = UrlFetchApp.fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress' },
      payload: JSON.stringify({ textQuery: SITES[site], maxResultCount: 1 }),
      muteHttpExceptions: true
    });
    var s = JSON.parse(search.getContentText());
    if (!s.places || !s.places.length) throw new Error('Place not found: ' + search.getContentText().slice(0, 300));
    placeId = s.places[0].id;
    props.setProperty('PLACE_ID_' + site, placeId);
  }

  var res = UrlFetchApp.fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId), {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error('Place details failed: ' + res.getContentText().slice(0, 300));
  var p = JSON.parse(res.getContentText());

  var reviews = (p.reviews || []).map(function (r) {
    var a = r.authorAttribution || {};
    return {
      name: a.displayName || 'Google user',
      profileUri: a.uri || '',
      photo: a.photoUri || '',
      rating: r.rating || 0,
      time: r.publishTime || '',
      relative: r.relativePublishTimeDescription || '',
      text: (r.text && r.text.text) || (r.originalText && r.originalText.text) || '',
      reviewUri: r.googleMapsUri || ''
    };
  });
  // Highest rating first, then newest.
  reviews.sort(function (x, y) { return (y.rating - x.rating) || (y.time > x.time ? 1 : y.time < x.time ? -1 : 0); });

  return {
    ok: true,
    name: (p.displayName && p.displayName.text) || '',
    rating: p.rating || null,
    count: p.userRatingCount || null,
    mapsUri: p.googleMapsUri || '',
    reviews: reviews,
    fetched: new Date().toISOString()
  };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor after adding the key, to check everything works.
function testSweetAndSuch() {
  var r = fetchReviews_('sweet-and-such');
  console.log(JSON.stringify({ name: r.name, rating: r.rating, count: r.count, reviews: r.reviews.length }));
}
