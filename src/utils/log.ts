import type { LevelType, LogType } from "@/stores/log";
import {
  convertAndSortRecord,
  findAllSubstringIndices,
  replaceSubstring,
  trimQuotesAndUnescape,
} from "./strings";

export type ColorOrTextType = {
  color: "processing" | "warning" | "error";
  text: string;
};
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
  return (obj[level] ?? {
    color: "processing",
    text: "日志",
  }) as ColorOrTextType;
};

export function searchTextToCommandsMap(
  searchText: string
): Map<string, string[]> {
  const commandObj = new Map<string, string[]>();
  if (!searchText) {
    return commandObj;
  }
  const searchArr = advancedSplit(searchText);
  for (let i = 0; i < searchArr.length; i++) {
    const e = searchArr[i];
    if (typeof e === 'string' && e.length <= 0) {
      continue;
    }
    if (e.includes(":") && !e.includes("\\:")) {
      // 说明是指令
      const commandArr = e.split(":");
      const command = commandArr[0];
      if (commandArr[1]?.length) {
        const value = commandObj.get(command) ?? [];
        value.push(commandArr[1]);
        commandObj.set(command, value.map(e => trimQuotesAndUnescape(e)));
      }
    } else {
      // 说明是普通文本，普通文本要将 文本 按照 text:文本 来处理
      const value = commandObj.get("text") ?? [];
      value.push(e);
      commandObj.set("text", value.map(e => trimQuotesAndUnescape(e)));
    }
  }
  return commandObj;
}

export function handleTextCommand(
  commandObj: Map<string, string[]>,
  logger: LogType,
  isCaseSensitive = false
) {
  if (commandObj.has("text")) {
    // 先把数组按字符串的长度排序，目的是照顾长的，这样在下面短的自动会被替换掉
    // 也就是如果出现 a ab 这两个，优先显示照顾 ab
    const values = (commandObj.get("text") ?? []).sort(
      (a, b) => a.length - b.length
    );
    const allIndices: Record<string, number> = {};
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const indices = findAllSubstringIndices(
        logger.text,
        val,
        isCaseSensitive
      );
      if (!Object.keys(indices).length) {
        return false;
      }
      /**
       * 这里使用对象的目的是为了长的替换短的，比如：{4:5} 这个时候有一个长的是: {4:6}
       * 那么很自然的就会把 {4:5} 替换掉
       */
      Object.assign(allIndices, indices);
    }

    /**
      将对象转换成数组，数组能保证顺序，要先处理字符串后面的下标，这样下标总是有效的
      如果先处理前面的，由于字符串被替换了，导致后面的下标不正确，比如：abc 假如有两个 0, 2
      假如先处理0，把0替换成123，这个时候就变成123bc，这个时候再处理2就会出现错乱
    */
    const tempIndices = convertAndSortRecord(allIndices);

    for (let j = 0; j < tempIndices.length; j += 1) {
      const { index, size } = tempIndices[j];
      const replacement = logger.text.slice(index, index + size);
      logger.text = replaceSubstring(
        logger.text,
        index,
        size,
        replacement
      );
    }

    return true;
  }
}

export function handleSingleTextToSelected(
  _logger: LogType,
  commandObj: Map<string, string[]>,
  isCaseSensitive = false
) {
  const logger = { ..._logger };
  if (!commandObj.size) {
    return { isDone: true, logger };
  }
  if (handleTextCommand(commandObj, logger, isCaseSensitive) === false) {
    return { isDone: false, logger };
  }
  const allCommand = commandObj.entries();
  let currentCommand = allCommand.next();
  while (!currentCommand.done) {
    const [command, values] = currentCommand.value as [
      keyof typeof logger,
      string[]
    ];
    if (
      !["formatData", "text"].includes(command) &&
      !values.includes(logger[command]?.toString() ?? "")
    ) {
      return { isDone: false, logger };
    }
    currentCommand = allCommand.next();
  }
  return { isDone: currentCommand.done, logger };
}


export function advancedSplit(input: string) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ' ' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    result.push(current);
  }
  
  return result;
}
