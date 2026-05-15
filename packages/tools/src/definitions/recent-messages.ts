/**
 * 最近消息工具
 *
 * 获取最近 N 条聊天消息。
 */

import type { ToolDefinition, ToolExecutionContext, ToolResult, JsonSchema } from '../types'

const inputSchema: JsonSchema = {
  type: 'object',
  properties: {
    limit: {
      type: 'number',
      description: '返回的消息条数',
      default: 20,
    },
  },
}

async function handler(params: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolResult> {
  const limit = (params.limit as number) || 20
  const result = await context.dataProvider!.getRecentMessages({ timeFilter: context.timeFilter, limit })

  const data = {
    returned: result.messages.length,
    messages: result.messages.map((m) => ({
      sender: m.senderName,
      content: m.content,
      time: new Date(m.timestamp * 1000).toISOString(),
    })),
  }

  return {
    content: JSON.stringify(data),
    data,
    rawMessages: result.messages,
  }
}

export const recentMessagesTool: ToolDefinition = {
  name: 'chatlab_recent_messages',
  description: '获取最近的聊天消息',
  inputSchema,
  handler,
  category: 'core',
  truncationStrategy: 'keep_last',
}
