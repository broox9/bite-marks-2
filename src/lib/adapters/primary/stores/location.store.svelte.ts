
// set up another default
const degreesPerMileMultiplier = 1.0145
let center = $state({ lat: 40.7484, lng: -73.9857 })
let name = $state('Midtown, New York')
let radiusMiles = $state(29) 
// move this to the setter or getter function
let radiusMeters = $derived(radiusMiles * 1609.34 ) // 1610 meters per mile 56500 ~= 35 miles

/*
Google Places
"Text Search" takes a `locationBias.circle.center` (lat/lng) ~ "Pizza in New York"
"Nearby Search" takes `locationRestriction.circle.center` (lat/lng) and `locationRestriction.circle.radius` (meters) + types
"Autocomplete" also takes `locationBias.circle.center` (lat/lng) and `locationRestriction.circle.radius` (meters) + input

*/


export const locationStore = {
  set name(newName) {
    name = newName
  },
  get name() {
    return name
  },
  get center() {
    return center
  },
  set center(newCenter) {
    center = newCenter
  },
  //radius
  get radiusMiles() {
    return radiusMiles
  },
  set radiusMiles(newRadius) {
    radiusMiles = newRadius
  },

  set radiusMeters (newRadius) {
    radiusMeters = newRadius
  },

  get radiusMeters() {
    return radiusMeters
  },

  getBounds() {
    // return this.bounds
        return {
            east: center.lng - 0.03,//-74.1,
            west: center.lng + 0.03,//-74.2,
            north: center.lat + 0.04,//40.8,
            south: center.lat - 0.04,//40.7
        }
    }
}