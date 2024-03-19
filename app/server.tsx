import http from 'http';
import axios from 'axios';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/players' && req.method === 'GET') {
    try {
      const response = await axios.get('http://localhost:5000/api/players'); // Assuming Flask is running on port 5000
      const players = response.data;
      res.statusCode = 200;
      res.end(JSON.stringify(players));
    } catch (error) {
      console.error('Error fetching players:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Backend server running at http://${hostname}:${port}/`);
});
