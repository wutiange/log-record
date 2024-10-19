export function convertAndSortRecord(record: Record<string, number>) {
  // 将对象转换为{key: number, value: number}格式的数组
  const array = Object.keys(record).map((key) => ({
    index: parseInt(key),
    size: record[key],
  }));

  // 根据key进行从大到小排序
  array.sort((a, b) => b.index - a.index);

  return array;
}

export function findAllSubstringIndices(
  str: string,
  searchStr: string,
  ignored = false,
) {
  let startIndex = 0;
  let index;
  const indices: Record<string, number> = {};
  const size = searchStr.length;
  while ((index = indexOf(str, searchStr, startIndex, ignored)) > -1) {
    indices[index] = size;
    startIndex = index + searchStr.length; // 移动到下一个可能的匹配位置
  }
  return indices;
}

export function indexOf(
  str: string,
  searchText: string,
  startIndex: number,
  ignored = false,
) {
  if (ignored) {
    return str
      .toLocaleLowerCase()
      .indexOf(searchText.toLocaleLowerCase(), startIndex);
  }
  return str.indexOf(searchText, startIndex);
}

export function replaceSubstring(
  str: string,
  index: number,
  length: number,
  replacement: string,
) {
  // 使用slice获取起始部分和结束部分，然后将它们与替换字符串拼接
  return str.slice(0, index) + replacement + str.slice(index + length);
}

export function trimQuotesAndUnescape(input: string): string {
  // 处理双引号的情况
  if (input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1, -1);
  }

  // 处理单引号的情况
  if (input.startsWith("'") && input.endsWith("'")) {
    return input.slice(1, -1);
  }

  // 处理转义双引号的情况
  if (input.startsWith('\\"') && input.endsWith('\\"')) {
    return '"' + input.slice(2, -2) + '"';
  }

  // 处理转义单引号的情况
  if (input.startsWith("\\'") && input.endsWith("\\'")) {
    return "'" + input.slice(2, -2) + "'";
  }

  // 其他情况保持不变
  return input;
}

export function parseUrl(url: string): string[] {
  try {
    // 创建 URL 对象
    const parsedUrl = new URL(url);

    // 获取域名（包括协议）
    const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    // 分割路径
    const pathSegments = parsedUrl.pathname
      .split('/')
      .filter((segment) => segment !== '');

    // 获取查询字符串（如果存在）
    const queryString = parsedUrl.search ? parsedUrl.search.slice(1) : '';

    // 合并最后一个路径段和查询字符串（如果存在）
    const lastSegment = pathSegments.pop() || '';
    const lastElement = queryString
      ? `${lastSegment}?${queryString}`
      : lastSegment;

    // 构建结果数组
    const result = [domain, ...pathSegments];
    if (lastElement) {
      result.push(lastElement);
    }

    return result;
  } catch (error) {
    console.error('Invalid URL:', error);
    return [];
  }
}
