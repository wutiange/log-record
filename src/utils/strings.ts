
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

export function findAllSubstringIndices(str: string, searchStr: string, ignored = false) {
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


export function indexOf(str: string, searchText: string, startIndex: number, ignored = false) {
  if (ignored) {
    return str.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase(), startIndex)
  }
  return str.indexOf(searchText, startIndex)
}

export function replaceSubstring (
  str: string,
  index: number,
  length: number,
  replacement: string
) {
  // 使用slice获取起始部分和结束部分，然后将它们与替换字符串拼接
  return str.slice(0, index) + replacement + str.slice(index + length);
}


export function swapTextToMark(text: string) {
  return `<span style="background-color: #cccc99; color: #666666;">${text}</span>`;
}