import express, { Express } from 'express';
import type { IncomingMessage, ServerResponse, Server } from 'http';
import { httpPort } from './config';
import { Bonjour, Service } from 'bonjour-service';
import deviceId from './utils/deviceId';

class ServerClient {
  private app: Express | null = null;
  private bonjour: Bonjour | null = null;
  private pairedServices: Record<string, Service> = {};
  private runningServer: Server<
    typeof IncomingMessage,
    typeof ServerResponse
  > | null = null;
  constructor() {
    this.app = express();
    this.bonjour = new Bonjour();
    this.app.use(express.json({ limit: '50mb' }));
  }

  scanBonjour(handleServices: (services: Service) => void) {
    this.bonjour.find({ type: 'http' }, (service) => {
      handleServices(service);
    });
  }

  connect(service: Service) {
    const { id, uniqueId } = service.txt ?? {};
    const ownUniqueId = `${deviceId}-${httpPort}`;
    if (id && !this.pairedServices[id] && uniqueId !== ownUniqueId) {
      // advertise an HTTP server on port 3000
      const server = this.bonjour.publish({
        name: `Log Record Server$$${id}`,
        type: 'http',
        port: httpPort,
        txt: { uniqueId: ownUniqueId, id },
      });
      this.pairedServices[service.txt.id] = server;
    }
  }

  startListen(
    pathHandle: Record<string, (msg: Record<string, unknown>) => void> = {},
  ) {
    this.stopListen();
    let id = 0;
    Object.entries(pathHandle).forEach(([path, handle]) => {
      this.app.post(path, function (req, res) {
        handle({ id: ++id, ...req.body });
        res.end(id.toString());
      });
    });

    this.runningServer = this.app.listen(httpPort);
  }

  stopListen() {
    // 当服务还在运行的时候，在关闭对话框的过程中需要把服务也关闭
    if (this.runningServer?.listening) {
      this.runningServer.close();
    }
  }
}

export default new ServerClient();
