import express, { Express, Response } from 'express';
import type { IncomingMessage, ServerResponse, Server } from 'http';
import { httpPort } from './config';
import { Bonjour } from 'bonjour-service';

const JOIN_PATH = '/join';
class ServerClient {
  private app: Express | null = null;
  private handlePhone: (model: string, id: string) => void;
  private runningServer: Server<
    typeof IncomingMessage,
    typeof ServerResponse
  > | null = null;
  private token = `${Date.now().toString(16)}-${Math.random().toString(16)}`;
  private clientIds: Record<string, Response> = {};
  private bonjour = new Bonjour();

  constructor() {
    this.app = express();
    this.app.use(express.json({ limit: '50mb' }));
  }

  publish() {
    this.bonjour.publish({
      name: `Log Record Server`,
      type: 'http',
      port: httpPort,
      protocol: 'tcp',
      txt: { path: JOIN_PATH, token: this.token },
    });
  }

  unpublish() {
    this.bonjour.unpublishAll(() => {
      console.log('bonjour unpublish');
    });
  }

  scanPhone(handlePhone: (model: string, id: string) => void) {
    this.handlePhone = handlePhone;
  }

  connect(model: string, id: string, isAgree: boolean) {
    this.clientIds[`${model}-${id}`]?.end(
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
    Object.entries(pathHandle).forEach(([path, handle]) => {
      this.app.post(path, function (req, res) {
        handle({ id: ++id, ...req.body });
        res.end(id.toString());
      });
    });

    this.app.post(JOIN_PATH, (req, res) => {
      const { model, token, id } = req.body;
      res.setHeader('Content-Type', 'application/json');
      if (this.token === token) {
        this.handlePhone(model, id);
        this.clientIds[`${model}-${id}`] = res;
      } else {
        res.end(JSON.stringify({ code: 1, message: 'Token error' }));
      }
    });

    this.runningServer = this.app.listen(httpPort);
    this.publish();
  }

  stopListen() {
    // 当服务还在运行的时候，在关闭对话框的过程中需要把服务也关闭
    if (this.runningServer?.listening) {
      this.runningServer.close();
    }
  }
}

export default new ServerClient();
