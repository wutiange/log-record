import polka, { Polka } from 'polka';
import { json } from 'body-parser';
import type { ServerResponse } from 'http';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { httpPort } from './config';
import { getSystemIdentifier } from './utils/node-strings';
import type Bonjour from 'bonjour-service';
import { version } from '../package.json';

const JOIN_PATH = '/join';

class ServerClient {
  private app: Polka | null = null;
  private httpServer: http.Server | null = null;
  private httpsServer: https.Server | null = null;
  private handlePhone: (model: string, clientIP: string) => void;
  private token = `${Date.now().toString(16)}-${Math.random().toString(16)}`;
  private clientIds: Record<string, ServerResponse> = {};
  private bonjour: Bonjour = null;
  // key 连接手机的 IP 地址，value 是 [手机型号，是否同意]
  private connectedPhones: Record<string, [string, boolean]> = {};

  constructor() {
    this.app = polka();
    this.app.use(json({ limit: '50mb' }));
  }

  private async getBonjourInstance() {
    if (!this.bonjour) {
      const { Bonjour } = await import('bonjour-service');
      this.bonjour = new Bonjour();
    }

    return this.bonjour;
  }

  // Get SSL options if certificates exist
  private getSSLOptions(): https.ServerOptions | null {
    try {
      const certificatePath = path.join(__dirname, "ssl/certificate.pem");
      const privateKeyPath = path.join(__dirname, "ssl/private-key.pem");
      if (!fs.existsSync(certificatePath) || !fs.existsSync(privateKeyPath)) {
        console.error("SSL certificate files not found in ssl directory");
        return null;
      }
      // Enhanced SSL options
      return {
        cert: fs.readFileSync(certificatePath),
        key: fs.readFileSync(privateKeyPath),
        minVersion: 'TLSv1',  // Allow older TLS versions for compatibility
        maxVersion: 'TLSv1.3', // Support up to TLS 1.3
        // Less restrictive cipher list for better compatibility
        ciphers: 'HIGH:!aNULL:!MD5:!RC4',
        honorCipherOrder: true,
        // Disable certificate validation for self-signed certs
        rejectUnauthorized: false
      };
    } catch (err) {
      console.error('Error loading SSL certificates:', err);
      return null;
    }
  }

  async publish() {
    const bonjour = await this.getBonjourInstance();
    const service = bonjour.publish({
      name: `Log_Record$$${this.token}`,
      type: 'http',
      port: httpPort,
      host: `log-record-${getSystemIdentifier()}.local`,
      protocol: 'tcp',
      txt: { path: JOIN_PATH, token: this.token },
    });
    service.on('error', (err) => {
      console.error(err, '-----服务发布失败');
    });
  }

  unpublish() {
    return new Promise((resolve) => {
      this.bonjour?.unpublishAll(() => {
        console.log('bonjour unpublish');
        resolve(true);
      });
    });
  }

  destroy() {
    return new Promise((resolve) => {
      this.bonjour?.destroy(() => {
        console.log('bonjour destroy');
        resolve(true);
      });
    });
  }

  scanPhone(handlePhone: (model: string, clientIP: string) => void) {
    this.handlePhone = handlePhone;
  }

  connect(clientIP: string, isAgree: boolean) {
    this.clientIds[clientIP]?.end(
      JSON.stringify({
        code: isAgree ? 0 : 2,
        message: isAgree ? 'ok' : 'Access denied',
      }),
    );
  }

  startListen(
    pathHandle: Record<string, (msg: Record<string, unknown>) => void> = {},
  ) {
    this.stopListen();
    let id = 0;

    // Add debugging middleware to log all requests
    this.app.use((req, res, next) => {
      const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${clientIP}`);
      next();
    });

    Object.entries(pathHandle).forEach(([path, handle]) => {
      this.app.post(path, (req, res) => {
        const clientIP =
          req.connection.remoteAddress || req.socket.remoteAddress;
        const isHandleLog = this.connectedPhones[clientIP]?.[1] ?? true;
        if (isHandleLog) {
          handle({ id: ++id, ...req.body });
        }
        res.end(id.toString());
      });
    });

    this.app.post(JOIN_PATH, (req, res) => {
      const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;
      const { model, token } = req.body;
      res.setHeader('Content-Type', 'application/json');
      if (this.token === token) {
        this.handlePhone(model, clientIP);
        this.clientIds[clientIP] = res;
        this.connectedPhones[clientIP] = [model, true];
      } else {
        res.end(JSON.stringify({ code: 1, message: 'Token error' }));
      }
    });

    // version
    this.app.get('/version', (req, res) => {
      res.end(version);
    });

    // Create HTTP server
    this.httpServer = http.createServer(this.app.handler);
    this.httpServer.listen(httpPort, () => {
      console.log(`HTTP server listening on http://127.0.0.1:${httpPort}`);
    });

    // Try to create HTTPS server if SSL certificates exist
    const sslOptions = this.getSSLOptions();
    if (sslOptions) {
      // Try to create and configure the HTTPS server with proper error handling
      try {
        this.httpsServer = https.createServer(sslOptions, this.app.handler);
        
        // Use httpPort + 1 for HTTPS
        const httpsPort = httpPort + 1;
        
        // Attach event listeners before starting the server
        this.httpsServer.on('error', (err) => {
          console.error('HTTPS server error:', err);
        });
        
        this.httpsServer.on('tlsClientError', (err: Error & { code?: string }, tlsSocket) => {
          console.error(`TLS Client Error: ${err.message}`);
          console.error(`Error code: ${err.code || 'unknown'}`);
          console.error(`Remote: ${tlsSocket.remoteAddress}:${tlsSocket.remotePort}`);
          // Dump more error details
          console.error(err);
        });
        
        this.httpsServer.on('secureConnection', (tlsSocket) => {
          console.log(`Secure connection established with ${tlsSocket.remoteAddress}`);
          console.log(`TLS Protocol: ${tlsSocket.getProtocol()}`);
          console.log(`Cipher: ${tlsSocket.getCipher().name}`);
        });
        
        // Start listening
        this.httpsServer.listen(httpsPort, () => {
          console.log(`HTTPS server listening on https://127.0.0.1:${httpsPort}`);
          console.log('Try opening this URL in your browser to test');
        });
        
        // Add a simple GET route for testing
        this.app.get('/test', (req, res) => {
          res.end(JSON.stringify({ status: 'OK', server: 'HTTPS working!' }));
        });
        
      } catch (err) {
        console.error('Failed to create HTTPS server:', err);
      }
    }

    this.publish();
  }

  stopCallbackLog(clientIP: string, isPlay: boolean) {
    const connectedPhone = this.connectedPhones[clientIP];
    if (!connectedPhone) {
      return;
    }
    this.connectedPhones[clientIP][1] = isPlay;
  }

  stopListen() {
    return new Promise((resolve) => {
      // Close HTTP server if exists
      if (this.httpServer) {
        this.httpServer.close((err) => {
          if (err) {
            console.warn(err, '-----HTTP服务关闭失败');
          } else {
            console.log('HTTP server closed');
          }
        });
      }

      // Close HTTPS server if exists
      if (this.httpsServer) {
        this.httpsServer.close((err) => {
          if (err) {
            console.warn(err, '-----HTTPS服务关闭失败');
          } else {
            console.log('HTTPS server closed');
          }
        });
      }

      // For backward compatibility, keep the original check
      this.app.server?.close((err) => {
        if (!err) {
          resolve(true);
          return;
        }
        resolve(false);
        console.warn(err, '-----服务关闭失败');
      });
    });
  }
}

export default new ServerClient();
