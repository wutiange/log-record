import { TreeProps } from 'ant-design-vue';
import { parseUrl } from './strings';
import type { SearchFilterType } from '@/types/global';
import { DataNode } from 'ant-design-vue/es/tree';

export function getStatusColor(statusCode?: number) {
  let statusCodeKey = 'default';

  if (!statusCode) {
    statusCodeKey = 'default';
  }
  // 2 开头的显示绿色
  else if (String(statusCode).startsWith('2')) {
    statusCodeKey = 'success';
  }
  // 5 开头的显示红色
  else if (String(statusCode).startsWith('5')) {
    statusCodeKey = 'error';
  }

  // 4 开头的显示黄色
  else if (String(statusCode).startsWith('4')) {
    statusCodeKey = 'warning';
  }

  return statusCodeKey;
}

export function addUrlToTree(
  treeData: TreeProps['treeData'],
  request: Record<string, any> = {},
): TreeProps['treeData'] {
  if (!request.url) {
    return treeData;
  }
  const urlParts = parseUrl(request.url);

  function generateNode(part: string, isLeaf: boolean) {
    return {
      title: part,
      key: isLeaf ? request.id : `${part}-${Date.now()}`, // 生成唯一的 key,
      children: [] as TreeProps['treeData'],
      isLeaf,
      selectable: isLeaf,
      statusCode: request.statusCode,
      statusCodeKey: request.loading
        ? 'processing'
        : getStatusColor(request.statusCode),
    };
  }

  function insertNode(
    nodes: TreeProps['treeData'],
    parts: string[],
    currentDepth = 0,
  ): void {
    const currentPart = parts[currentDepth];

    if (!currentPart) return;

    let existingNode = nodes.find((node) => node.title === currentPart);
    if (currentDepth === parts.length - 1) {
      const requestExist = nodes.find((node) => node.key === request.id);
      if (!requestExist) {
        existingNode = generateNode(currentPart, true);
        nodes.push(existingNode);
      } else {
        Object.assign(requestExist, {
          statusCode: request.statusCode,
          statusCodeKey: getStatusColor(request.statusCode),
          loading: request.loading ?? false,
        });
      }
    } else if (!existingNode) {
      existingNode = generateNode(currentPart, false);
      nodes.push(existingNode);
    }

    if (!existingNode.children) {
      existingNode.children = [];
    }

    if (existingNode.children) {
      insertNode(existingNode.children, parts, currentDepth + 1);
    }
  }

  insertNode(treeData, urlParts);
  return [...treeData];
}

export function filterDataNodes(
  nodes: TreeProps['treeData'],
  filter: SearchFilterType,
): DataNode[] {
  // 递归函数来处理节点及其子节点
  function filterNode(node: DataNode): DataNode | null {
    // 转换标题和搜索文本为字符串
    let nodeTitle = String(node.title || '');
    let searchText = filter.text;

    // 如果不区分大小写，将标题和搜索文本转换为小写
    if (!filter.isCaseSensitive) {
      searchText = searchText.toLowerCase();
      nodeTitle = nodeTitle.toLowerCase();
    }

    // 检查标题是否包含搜索文本
    if (nodeTitle.includes(searchText)) {
      // 如果匹配，返回节点的浅拷贝（不包括子节点）
      return node;
    }

    // 如果有子节点，递归过滤子节点
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is DataNode => child !== null);

      // 如果有匹配的子节点，返回带有过滤后子节点的新节点
      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
    }

    // 如果没有匹配，返回 null
    return null;
  }

  // 使用 map 和 filter 来处理顶层节点
  return nodes
    .map(filterNode)
    .filter((node): node is DataNode => node !== null);
}
