// File origin: VS1LAB A3

const GeoTag = require("./geotag");
const GeoTagExamples = require("./geotag-examples");

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{
    static getGeoTags(page = -1) { //todo pagination
        console.log("[getGeoTags] -> " + page);
        return this.pagination(this.#geoTags, page);
    }

    static getGeoTag(index){ //Get geotag by index
        try{
            index = parseInt(index);
            return this.#geoTags[index];
        } catch (e){
            throw new Error(e);
            return 0;
        }
    }

    static #maxItems = 6;
    static #geoTags = this.addGeoTagExamples();


    static addGeoTagExamples(){
        let arr = GeoTagExamples.tagList;
        let arr2 = [];
        for (let i = 0; i < arr.length; i++){
            arr2.push(new GeoTag(arr[i][1], arr[i][2], arr[i][0], arr[i][3]));
        }
        return arr2;
    }

    static addGeoTag(lat, long, nm, ht){
        // If GeoTag latitude, longitude, name, hashtag is provided, create new GeoTag, then add to [geoTags] array
        var tag = new GeoTag(lat, long, nm, ht);
        this.#geoTags.push(tag);
        return tag;
    }

    static setGeoTag(lat, long, nm, ht, index){
        try{
            let tag = new GeoTag(lat, long, nm, ht);
            this.#geoTags[index] = tag;
            return tag;
        } catch (e){
            throw new Error(e);
        }
    }

    static deleteGeoTag(i){ // Delete geotag and return the deleted geotag
        try {
            let tag = this.#geoTags[i];
            this.#geoTags.splice(i, 1);
            return tag;
        } catch (e) {
            throw new Error(e);
        }
    }

    static removeGeoTag(name){
        // remove Element by name from [geoTags] array 
        for (var v = 0; v < this.#geoTags.length; v++){
            if (this.#geoTags[v].name == name){
                this.#geoTags = this.#geoTags.splice(v, 1);
                break;
            }
        }
    }

    static getNearbyGeoTags(lat, long, radius, page = -1){ //todo Pagination
        // return array of all geotags within radius of positon ([latitude], [longitude])
        var arr = [];
        for (var i = 0; i < this.#geoTags.length; i++){
            if (this.dist(this.#geoTags[i].latitude, this.#geoTags[i].longitude, lat, long) <= radius){
                arr.push(this.#geoTags[i]);
            }
        } 
        return this.pagination(arr, page);
    }

    static dist(lat1, lon1, lat2, lon2){
        //Haversine formula to find distance between two points on a sphere
        let dLat = (lat2 - lat1) * Math.PI / 180.0;
        let dLon = (lon2 - lon1) * Math.PI / 180.0;
           
        lat1 = (lat1) * Math.PI / 180.0;
        lat2 = (lat2) * Math.PI / 180.0;
         
        let a = Math.pow(Math.sin(dLat / 2), 2) +
                   Math.pow(Math.sin(dLon / 2), 2) *
                   Math.cos(lat1) *
                   Math.cos(lat2);
        let rad = 6371;
        let c = 2 * Math.asin(Math.sqrt(a));
        return rad * c;
    }

    static searchNearbyGeoTags(lat, long, radius, keyword, page = -1){ // todo Pagination
        // get array of all geotags within radius of positon ([latitude], [longitude])
        // then add to [arr2] any geotags with partial string in keyword 
        var arr = this.getNearbyGeoTags(lat, long, radius, -1);
        var arr2 = [];
        for (var i = 0; i < arr.length; i++){
            if (arr[i].name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || arr[i].hashtag.toLowerCase().indexOf(keyword.toLowerCase()) > -1){
                arr2.push(arr[i]);
            }
        }
        return this.pagination(arr2, page);
    }

    static pagination(arr, page){
        if (page === -1) {return [arr.slice(0, (arr.length < 6 ? arr.length : 6)) ,[(arr.length === 0 ? 0 : 1),Math.ceil(arr.length/this.#maxItems), arr.length]]}
        page = page - 1;
        let itemCount = arr.length;
        let maxPage = Math.ceil(itemCount/this.#maxItems);
        return [(itemCount <= this.#maxItems ? arr :
                arr.slice(page * this.#maxItems,
                    ((page+1) * this.#maxItems >= itemCount ? itemCount : (page+1) * this.#maxItems)
                )
        ), [page + 1, maxPage, itemCount]];
    }
}



module.exports = InMemoryGeoTagStore
