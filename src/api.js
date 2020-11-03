import {show_dialog} from './functions.js';

// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://127.0.0.1:5000/'

const getJSON = (path, options) => {
    return new Promise((resolve, reject) => {
        fetch(path, options)
        .then(res => {
            if (res.status === 200) {
                resolve(res.json());
            } else {
                res.json().then(decodedData => {
                    reject(decodedData['message']);
                }).catch(err => alert(err))
            }
        })
        .catch(function(e) {
            reject(e);
        }); 
    });
}


        
/**
 * This is a sample class API which you may base your code on.
 * You may use this as a launch pad but do not have to.
 */
export default class API {
    /** @param {String} url */
    constructor(url) {
        this.url = url;
    } 

    /** @param {String} path */
    makeAPIRequest(path) {
        return getJSON(`${this.url}/${path}`);
    }

    // Handle POST requests
    post(path, payload) {
        const options = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            },

        }
        return getJSON(`${this.url}/${path}`, options);
    }

    // Handle GET requests
    get(path, token, queries) {
        var queryString = "";

        if (queries) {
            queryString = "?";

            for (let key in queries) {
                queryString = queryString + key + "=" + queries[key] + "&";
            }
        queryString = queryString.slice(0, -1); 
        }

        console.log(`GET ${this.url}/${path}${queryString}`);
         const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },

        }
        return getJSON(`${this.url}/${path}${queryString}`, options); 
    }

    // Handle PUT requests
    put(path, token, queries, payload) {

        var queryString = "";

        if (queries) {
            queryString = "?";

            for (let key in queries) {
                queryString = queryString + key + "=" + queries[key] + "&";
            }
        queryString = queryString.slice(0, -1); 
        }
        

         const options = {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },

        }
        return getJSON(`${this.url}/${path}${queryString}`, options); 
    }

    // Handle PUT request specifically for updating settings
    put_settings(path, token, object) {
        let p = {};
        for (let key in object) {
            if (object[key]) {
                p[key] = object[key];
            }
        }

        const options = {
            method: 'PUT',
            body: JSON.stringify(p),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },

        }
        return getJSON(`${this.url}/${path}`, options); 
    }

    // Posting Images
    post_image(path, payload, token) {
        const options = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },

        }
        return getJSON(`${this.url}/${path}`, options);
    }

    // Handle DELETE requests
    delete(path, token, queries) {
        var queryString = "";

        if (queries) {
            queryString = "?";

            for (let key in queries) {
                queryString = queryString + key + "=" + queries[key] + "&";
            }
        queryString = queryString.slice(0, -1); 
        }

        console.log(`GET ${this.url}/${path}${queryString}`);
         const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },

        }
        return getJSON(`${this.url}/${path}${queryString}`, options); 
    }

}
