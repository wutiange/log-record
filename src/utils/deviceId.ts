import { execSync } from 'child_process';
import os from 'os';
import crypto from 'crypto';

function getWindowsUUID() {
  try {
    // 获取主板序列号
    const motherboardSN = execSync('wmic csproduct get uuid')
      .toString()
      .split('\n')[1]
      .trim();
    // 获取CPU ID
    const cpuId = execSync('wmic cpu get processorid')
      .toString()
      .split('\n')[1]
      .trim();
    // 获取BIOS序列号
    const biosSN = execSync('wmic bios get serialnumber')
      .toString()
      .split('\n')[1]
      .trim();

    // 组合信息并生成哈希
    const combined = `${motherboardSN}-${cpuId}-${biosSN}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  } catch (error) {
    console.error('获取 Windows 设备 ID 失败:', error);
    return null;
  }
}

function getMacUUID() {
  try {
    // 获取硬件UUID
    const hardwareUUID = execSync(
      "ioreg -d2 -c IOPlatformExpertDevice | awk -F\\\" '/IOPlatformUUID/{print $(NF-1)}'",
    )
      .toString()
      .trim();
    // 获取序列号
    const serialNumber = execSync(
      "system_profiler SPHardwareDataType | awk '/Serial/ {print $4}'",
    )
      .toString()
      .trim();

    // 组合信息并生成哈希
    const combined = `${hardwareUUID}-${serialNumber}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  } catch (error) {
    console.error('获取 macOS 设备 ID 失败:', error);
    return null;
  }
}

function getDeviceId() {
  const platform = os.platform();

  if (platform === 'win32') {
    return getWindowsUUID();
  } else if (platform === 'darwin') {
    return getMacUUID();
  } else {
    throw new Error('不支持的操作系统');
  }
}

const deviceId = getDeviceId();

export default deviceId;
