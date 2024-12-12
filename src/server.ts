import polka, { Polka } from 'polka';
import { json } from 'body-parser';
import type { ServerResponse } from 'http';
import { httpPort } from './config';
import { getSystemIdentifier } from './utils/node-strings';
import type Bonjour from 'bonjour-service';

const JOIN_PATH = '/join';

class ServerClient {
  private app: Polka | null = null;
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
    this.bonjour?.unpublishAll(() => {
      console.log('bonjour unpublish');
    });
  }

  destroy() {
    this.bonjour?.destroy(() => {
      console.log('bonjour destroy');
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

    this.app.listen(httpPort);
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
    this.app.server?.close((err) => {
      if (!err) {
        return;
      }
      console.warn(err, '-----服务关闭失败');
    });
  }
}

export default new ServerClient();
