"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Link, Plus } from "lucide-react"

interface NotionEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

type BlockType = 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'bulleted_list' | 'numbered_list' | 'quote' | 'todo'

interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
}

export function NotionEditor({ value, onChange, placeholder = "Start writing...", className = "" }: NotionEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!value.trim()) {
      return [{ id: '1', type: 'paragraph', content: '' }]
    }

    // Parse existing content into blocks
    return value.split('\n').map((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        return { id: String(index + 1), type: 'heading_1', content: trimmed.slice(2) }
      } else if (trimmed.startsWith('## ')) {
        return { id: String(index + 1), type: 'heading_2', content: trimmed.slice(3) }
      } else if (trimmed.startsWith('### ')) {
        return { id: String(index + 1), type: 'heading_3', content: trimmed.slice(4) }
      } else if (trimmed.startsWith('- ')) {
        return { id: String(index + 1), type: 'bulleted_list', content: trimmed.slice(2) }
      } else if (trimmed.startsWith('1. ')) {
        return { id: String(index + 1), type: 'numbered_list', content: trimmed.slice(3) }
      } else if (trimmed.startsWith('> ')) {
        return { id: String(index + 1), type: 'quote', content: trimmed.slice(2) }
      } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        return {
          id: String(index + 1),
          type: 'todo',
          content: trimmed.slice(6),
          checked: trimmed.startsWith('- [x] ')
        }
      } else {
        return { id: String(index + 1), type: 'paragraph', content: line }
      }
    }).filter(block => block.content || blocks.length === 1)
  })

  const [focusedBlockId, setFocusedBlockId] = useState<string>('1')
  const editorRef = useRef<HTMLDivElement>(null)

  // Update parent component when blocks change
  useEffect(() => {
    const content = blocks.map(block => {
      switch (block.type) {
        case 'heading_1': return `# ${block.content}`
        case 'heading_2': return `## ${block.content}`
        case 'heading_3': return `### ${block.content}`
        case 'bulleted_list': return `- ${block.content}`
        case 'numbered_list': return `1. ${block.content}`
        case 'quote': return `> ${block.content}`
        case 'todo': return `- [${block.checked ? 'x' : ' '}] ${block.content}`
        default: return block.content
      }
    }).join('\n')

    onChange(content)
  }, [blocks, onChange])

  const addBlock = useCallback((index: number, type: BlockType = 'paragraph') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: ''
    }

    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
    setFocusedBlockId(newBlock.id)
  }, [blocks])

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ))
  }, [])

  const removeBlock = useCallback((id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => {
        const index = prev.findIndex(block => block.id === id)
        const newBlocks = prev.filter(block => block.id !== id)
        if (index > 0) {
          setFocusedBlockId(newBlocks[index - 1]?.id || newBlocks[0]?.id)
        } else {
          setFocusedBlockId(newBlocks[0]?.id)
        }
        return newBlocks
      })
    } else {
      // If it's the last block, just clear its content
      updateBlock(id, { content: '' })
    }
  }, [blocks, updateBlock])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string, index: number) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      // For empty blocks (except todo), remove them
      if (!block.content.trim() && block.type !== 'todo') {
        removeBlock(blockId)
        return
      }

      // Add new block of the same type
      addBlock(index, block.type)
    } else if (e.key === 'Backspace' && !block.content && blocks.length > 1) {
      e.preventDefault()
      removeBlock(blockId)
    } else if (e.key === '/' && !block.content) {
      // Could add slash command menu here
    }
  }, [blocks, addBlock, removeBlock])

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      value: block.content,
      onChange: (content: string) => updateBlock(block.id, { content }),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id, index),
      onFocus: () => setFocusedBlockId(block.id),
      placeholder: index === 0 ? placeholder : "Type '/' for commands",
      className: "w-full border-0 bg-transparent resize-none focus:outline-none focus:ring-0 py-2 px-3 min-h-[24px]"
    }

    switch (block.type) {
      case 'heading_1':
        return (
          <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">
            <textarea {...commonProps} className={`${commonProps.className} text-3xl font-bold`} />
          </h1>
        )
      case 'heading_2':
        return (
          <h2 className="text-2xl font-semibold border-b border-gray-100 pb-1">
            <textarea {...commonProps} className={`${commonProps.className} text-2xl font-semibold`} />
          </h2>
        )
      case 'heading_3':
        return (
          <h3 className="text-xl font-medium">
            <textarea {...commonProps} className={`${commonProps.className} text-xl font-medium`} />
          </h3>
        )
      case 'bulleted_list':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-3 text-gray-400">•</span>
            <textarea {...commonProps} />
          </div>
        )
      case 'numbered_list':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-3 text-gray-400 w-6">1.</span>
            <textarea {...commonProps} />
          </div>
        )
      case 'quote':
        return (
          <div className="border-l-4 border-gray-200 pl-4 bg-gray-50">
            <textarea {...commonProps} className={`${commonProps.className} italic text-gray-700`} />
          </div>
        )
      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              className="mt-3 rounded border-gray-300"
            />
            <textarea
              {...commonProps}
              className={`${commonProps.className} ${block.checked ? 'line-through text-gray-400' : ''}`}
            />
          </div>
        )
      default:
        return <textarea {...commonProps} />
    }
  }

  return (
    <div className={`notion-editor ${className}`}>
      <div className="space-y-1" ref={editorRef}>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative rounded-lg hover:bg-gray-50 transition-colors ${
              focusedBlockId === block.id ? 'bg-blue-50/50 ring-1 ring-blue-200' : ''
            }`}
          >
            {renderBlock(block, index)}

            {/* Block menu button */}
            <button
              onClick={() => addBlock(index, 'paragraph')}
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded shadow-sm p-1 hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 p-2 border-t bg-gray-50 rounded-b-lg">
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'paragraph' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Plain text"
        >
          <span className="text-xs font-medium">P</span>
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'heading_1' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'heading_2' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'heading_3' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-gray-300" />
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'bulleted_list' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'numbered_list' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'quote' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const block = blocks.find(b => b.id === focusedBlockId)
            if (block) updateBlock(focusedBlockId, { type: 'todo' })
          }}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
          title="To-do"
        >
          <span className="text-xs">☑</span>
        </button>
      </div>
    </div>
  )
}