const http = require('http');

async function runTests() {
  const req = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const request = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });

      request.on('error', reject);
      if (body) request.write(JSON.stringify(body));
      request.end();
    });
  };

  try {
    console.log('Testing GET /seniors...');
    const seniors = await req('/seniors');
    console.log(`Seniors count: ${seniors.data.length}`);

    console.log('\nTesting GET /next-question...');
    const q1 = await req('/next-question?session_id=test1');
    console.log('Q1:', q1);

    console.log('\nTesting POST /submit-swipe...');
    const swipeRes = await req('/submit-swipe', 'POST', {
      session_id: 'test1',
      senior_id: q1.data.senior_id,
      trait_id: q1.data.trait_id,
      response: 'yes'
    });
    console.log('Submit Response:', swipeRes);

    console.log('\nTesting GET /next-question again (should be different)...');
    const q2 = await req('/next-question?session_id=test1');
    console.log('Q2:', q2);
    
    console.log('\nTesting GET /leaderboard...');
    const lb = await req('/leaderboard');
    console.log('Leaderboard:', lb.data.slice(0, 2));

  } catch (err) {
    console.error('Test error:', err);
  }
}

runTests();
