import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // console.log(req);
    // We are on the server
    axios.defaults.baseURL = 'http://app:3000/';
    return axios.create({
      baseURL:
        'http://app:3000/',
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    axios.defaults.baseURL = 'http://localhost:3000/';
    return axios.create({
      baseUrl: 'http://localhost:3000/'
    });
  }
};
