"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `min-h-[90px] border border-input rounded-md focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-sm w-full px-3 py-2 bg-background ${className || ''}`,
        placeholder: placeholder || '',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!mounted || !editor) {
    return <div className={className || "min-h-[90px]"} />
  }

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  )
}
