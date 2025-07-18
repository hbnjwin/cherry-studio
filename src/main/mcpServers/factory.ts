import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import Logger from 'electron-log'

import BraveSearchServer from './brave-search'
import DifyKnowledgeServer from './dify-knowledge'
import FetchServer from './fetch'
import FileSystemServer from './filesystem'
import MemoryServer from './memory'
import PythonServer from './python'
import ThinkingServer from './sequentialthinking'

export function createInMemoryMCPServer(name: string, args: string[] = [], envs: Record<string, string> = {}): Server {
  Logger.info(`[MCP] Creating in-memory MCP server: ${name} with args: ${args} and envs: ${JSON.stringify(envs)}`)
  switch (name) {
    case '@tutu/memory': {
      const envPath = envs.MEMORY_FILE_PATH
      return new MemoryServer(envPath).server
    }
    case '@tutu/sequentialthinking': {
      return new ThinkingServer().server
    }
    case '@tutu/brave-search': {
      return new BraveSearchServer(envs.BRAVE_API_KEY).server
    }
    case '@tutu/fetch': {
      return new FetchServer().server
    }
    case '@tutu/filesystem': {
      return new FileSystemServer(args).server
    }
    case '@tutu/dify-knowledge': {
      const difyKey = envs.DIFY_KEY
      return new DifyKnowledgeServer(difyKey, args).server
    }
    case '@cherry/python': {
      return new PythonServer().server
    }
    default:
      throw new Error(`Unknown in-memory MCP server: ${name}`)
  }
}
