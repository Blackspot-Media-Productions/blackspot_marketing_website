"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "active" : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function BodyEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write the article…",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: instance }) => {
      onChange(instance.isEmpty ? "" : instance.getHTML());
    },
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="bodyEditor">
      <div className="bodyToolbar" role="toolbar" aria-label="Text formatting">
        <ToolbarButton
          label="Paragraph"
          active={editor?.isActive("paragraph")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          label="Heading"
          active={editor?.isActive("heading", { level: 2 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Subhead"
          active={editor?.isActive("heading", { level: 3 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <span className="toolbarRule" />
        <ToolbarButton
          label="Bold"
          active={editor?.isActive("bold")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor?.isActive("italic")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          active={editor?.isActive("underline")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <span className="toolbarRule" />
        <ToolbarButton
          label="Quote"
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Bullets"
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbers"
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Link"
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={setLink}
        />
        <span className="toolbarRule" />
        <ToolbarButton
          label="Undo"
          disabled={!editor?.can()?.undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          disabled={!editor?.can()?.redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
