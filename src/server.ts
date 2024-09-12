import express, { Express } from 'express';
import type { IncomingMessage, ServerResponse, Server } from 'http';
import { httpPort } from './config';

class ServerClient {
  private app: Express | null = null;
  private runningServer: Server<
    typeof IncomingMessage,
    typeof ServerResponse
  > | null = null;
  constructor() {
    this.app = express();
    this.app.use(express.json({ limit: '50mb' }));
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
