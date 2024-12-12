import os from 'os';
import crypto from 'crypto';

function getIPAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal
        ) {
          return alias.address;
        }
      }
    }
  }
  return '0.0.0.0'; // 如果没有找到合适的IP地址，返回一个默认值
}

function getSystemIdentifier() {
  // 获取系统信息
  const hostname = os.hostname();
  const username = os.userInfo().username;

  // 组合信息并转换为小写
  const systemInfo = `${hostname}-${username}`.toLowerCase();

  // 使用 md5 处理并截取前 8 位
  // 8位已经有 16^8 = 4,294,967,296 种可能，足够作为本地开发使用
  const hash = crypto
    .createHash('md5')
    .update(systemInfo)
    .digest('hex')
    .slice(0, 8);

  return hash;
}
export { getIPAddress, getSystemIdentifier };
