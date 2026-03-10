const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/customer/loyalty', {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE' // This won't work without a real token
      }
    });
    console.log(res.data);
  } catch(e) {
    console.log("Error:", e.response?.data || e.message);
  }
}
test();
