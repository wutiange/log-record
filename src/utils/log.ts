import type { LevelType } from "@/stores/log";

export type ColorOrTextType = {
  color: 'processing' | 'warning' | 'error';
  text: string
}
export const getColorAndText = (level: LevelType) => {
  const obj = {
    log: {
      color: "processing",
      text: "日志",
    },
    warn: {
      color: "warning",
      text: "警告",
    },
    error: {
      color: "error",
      text: "错误",
    },
  };
  return (obj[level] ?? ({
    color: "processing",
    text: "日志",
  })) as ColorOrTextType;
};

/**
 * 根据时间戳得到时分秒
 * @param timestamp 时间戳
 * @returns 时分秒
 */
export function getHMS(timestamp: number) {
  const now: Date = new Date(timestamp);
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}