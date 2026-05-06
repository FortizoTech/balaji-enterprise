'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon,
    Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuButton = ({ onClick, isActive, disabled, children, title }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
            "p-2 rounded-md transition-colors",
            isActive ? "bg-[#111] text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
            disabled && "opacity-30 cursor-not-allowed"
        )}
    >
        {children}
    </button>
);

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#C5A572] underline underline-offset-4 cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white focus-within:border-[#C5A572] transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </MenuButton>

                <div className="flex-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </MenuButton>
            </div>

            {/* Editor Area */}
            <div className="p-4 min-h-[250px] font-body text-sm text-gray-700 prose prose-sm max-w-none prose-stone focus:outline-none">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap {
                    min-height: 250px;
                }
                .tiptap:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
}
