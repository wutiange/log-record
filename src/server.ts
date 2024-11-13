import polka, { Polka } from 'polka';
import { json } from 'body-parser';
import type { ServerResponse } from 'http';
import { httpPort } from './config';

const JOIN_PATH = '/join';

class ServerClient {
  private app: Polka | null = null;
  private handlePhone: (model: string, id: string) => void;
  private token = `${Date.now().toString(16)}-${Math.random().toString(16)}`;
  private clientIds: Record<string, ServerResponse> = {};
  private bonjour: any = null;

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

  async publish() {
    const bonjour = await this.getBonjourInstance();
    bonjour.publish({
      name: `Log Record Server$$${this.token}`,
      type: 'http',
      port: httpPort,
      host: 'log-record.local',
      protocol: 'tcp',
      txt: { path: JOIN_PATH, token: this.token },
    });
  }

  unpublish() {
    this.bonjour?.unpublishAll(() => {
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
      this.app.post(path, (req, res) => {
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

    this.app.listen(httpPort);
    this.publish();
  }

  stopListen() {
    this.app.server?.close((err) => {
      if (!err) {
        return;
      }
      console.warn(err, '-----服务关闭失败');
    });
  }
}

export default new ServerClient();
