/**
  Copyright (c) 2015, 2024, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log('Running before_serve hook.');
    const target = 'http://localhost:8080';
    const proxyMiddleware = (req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/v1/')) {
        next();
        return;
      }

      const targetUrl = new URL(target + req.url);
      const client = targetUrl.protocol === 'https:' ? https : http;

      const outgoingHeaders = { ...req.headers };
      delete outgoingHeaders.host;
      delete outgoingHeaders.origin;
      delete outgoingHeaders.referer;

      const options = {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        method: req.method,
        path: targetUrl.pathname + targetUrl.search,
        headers: outgoingHeaders
      };

      const proxyReq = client.request(options, (proxyRes) => {
        const responseHeaders = { ...proxyRes.headers };
        responseHeaders['access-control-allow-origin'] = 'http://localhost:8000';
        responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        responseHeaders['access-control-allow-headers'] = 'Content-Type, Authorization, X-Requested-With';
        delete responseHeaders['content-security-policy'];
        res.writeHead(proxyRes.statusCode || 500, responseHeaders);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on('error', (err) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
      });

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.end();
        return;
      }

      req.pipe(proxyReq, { end: true });
    };

    configObj.preMiddleware = configObj.preMiddleware || [];
    configObj.preMiddleware.push(proxyMiddleware);
    resolve(configObj);
  });
};
