require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const NANIT_BASE_URL = 'https://my.nanit.com';

const createHeaders = (nextActionId) => {
    return {
      'Accept': 'text/x-component',
      'Content-Type': 'text/plain;charset=UTF-8',
      'Next-Action': nextActionId,
    };
  };

// Middleware
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('success');
});

// Video stream start endpoint
app.get('/nanit/video', async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1];

    const response = await axios.get('https://media-web-secured.nanit.com/hls/babies/4356be17.m3u8', {
      responseType: 'stream',
      headers: {
        'accept': '*/*',
        'cache-control': 'no-cache',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'cookie': `baby_token=${token}; ajs_anonymous_id=126c2a43-7950-4eb4-ad08-4b95a92f9bfd; ajs_user_id=2243989`
      },
      withCredentials: true
    });

    // Forward the appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'],
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Pipe the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
});

// Video stream content endpoint
app.get(/\/(.*\.ts)$/, async (req, res) => {
  try {
    const resource = req.path.substring(req.path.lastIndexOf('/') + 1);

    const response = await axios.get(`https://media-web-secured.nanit.com/hls/${resource}`, {
      responseType: 'stream'
    });

    // Forward the appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'],
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Pipe the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
});

// Login endpoint
app.post('/nanit/login', async (req, res) => {
  try {
    const response = await axios.post(
      `${NANIT_BASE_URL}/login`,
      [{
        email: req.body.email,
        password: req.body.password,
        successRedirectUrl: '/cameras-and-plans',
        redirectOnSuccess: true
      }],
      {
        headers: createHeaders('7fc3b08b343cd26420b7d30cdf22b34f932ce5a81c'),
      }
    );
    
    res.status(response.status).send(response.data);
  } catch (error) {

    console.error('Proxy error:', error.message);

    res.status(500).json({ 
      error: 'Proxy error', 
      details: error.message 
    });
  }
});

// MFA verification endpoint
app.post('/nanit/verify-mfa', async (req, res) => {
  try {
    const response = await axios.post(
      `${NANIT_BASE_URL}/login/mfa-required`,
      [{
        successUrl: '/cameras-and-plans',
        mfaCode: req.body.mfaCode,
        email: req.body.email,
        password: req.body.password,
        phoneSuffix: req.body.phoneSuffix,
        channel: 'sms',
        mfaToken: req.body.mfaToken
      }],
      {
        headers: createHeaders('7f505092cdf6371d5ef91c8a8d17fdcd931486b8e9'),
        maxRedirects: 0
      }
    );
    
    res.status(response.status).send(response.data);

  } catch (error) {
    if(error.response.status === 303)
    {
      res.status(200).send(error.response.data);
    }

    console.error('MFA verification error:', error.message);

    res.status(500).json({ 
      error: 'MFA verification failed', 
      details: error.message 
    });
  }
});

//baby token endpoint
app.post('/nanit/baby-token', async (req, res) => {
  try {
    const response = await axios.get(
      `https://media-web-secured.nanit.com/babies/${req.body.babyId}/tokens`,
      {
        headers: {
          Authorization: `token ${req.body.token}`,
        }
      }
    );
    
    res.status(response.status).send(response.data.replace(/\n/g, ""));
  } catch (error) {

    console.error('Proxy error:', error.message + ` token ${req.body.token}`);

    res.status(500).json({ 
      error: 'Proxy error', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
