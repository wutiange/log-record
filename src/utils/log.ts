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
