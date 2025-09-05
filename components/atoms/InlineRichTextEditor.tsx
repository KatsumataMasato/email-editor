"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Palette,
  Type,
  RotateCcw,
  Link,
} from "lucide-react";

interface InlineRichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function InlineRichTextEditor({
  initialContent,
  onChange,
  style = {},
  className = "",
}: InlineRichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [currentFontSize, setCurrentFontSize] = useState("16");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentBgColor, setCurrentBgColor] = useState("transparent");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [content, setContent] = useState(
    initialContent || "テキストを入力してください"
  );
  const savedRangeRef = useRef<Range | null>(null);
  const [isInteractingToolbar, setIsInteractingToolbar] = useState(false);

  // テキスト選択の監視
  const handleSelectionChange = useCallback(() => {
    if (!isEditing || !editorRef.current) return;
    // ツールバー操作中は選択状態の変化に反応せず、ツールバーを維持
    if (isInteractingToolbar) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      // エディター内の選択かチェック
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      // 選択範囲を保存して、ツール操作時にも復元可能にする
      savedRangeRef.current = range.cloneRange();

      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const newPosition = {
          top: rect.top - 70 + window.scrollY,
          left: Math.max(10, rect.left + rect.width / 2 - 160),
        };
        setToolbarPosition(newPosition);
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
    }
  }, [isEditing, isInteractingToolbar]);

  useEffect(() => {
    if (isEditing) {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }
  }, [isEditing, handleSelectionChange]);

  // 親からの初期値変更を、編集中でない時に同期
  useEffect(() => {
    if (
      !isEditing &&
      typeof initialContent === "string" &&
      initialContent !== "" &&
      initialContent !== content
    ) {
      setContent(initialContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
    }
  }, [initialContent, isEditing, content]);

  // エディター開始
  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const startEditing = useCallback(() => {
    setIsEditing(true);
    // クリック位置での選択/キャレット確定を優先し、カーソル位置は移動しない
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  }, []);

  // エディター終了
  const finishEditing = useCallback(() => {
    // ツールバー操作中は編集終了しない（blurしても保持）
    if (isInteractingToolbar) return;

    setIsEditing(false);
    setShowToolbar(false);

    if (editorRef.current) {
      const finalContent = editorRef.current.innerHTML;
      setContent(finalContent);
      onChange(finalContent);
    }
  }, [onChange, isInteractingToolbar]);

  // 確実なフォーマット適用関数
  const applyFormatToSelection = useCallback(
    (formatFn: (range: Range) => void) => {
      if (!isEditing || !editorRef.current) return;

      let selection = window.getSelection();
      let range: Range | null = null;
      if (
        selection &&
        selection.rangeCount > 0 &&
        !selection.isCollapsed &&
        editorRef.current.contains(
          selection.getRangeAt(0).commonAncestorContainer
        )
      ) {
        range = selection.getRangeAt(0);
      } else if (
        savedRangeRef.current &&
        editorRef.current.contains(
          savedRangeRef.current.commonAncestorContainer
        )
      ) {
        // 直前の選択範囲を復元
        range = savedRangeRef.current.cloneRange();
        selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      if (!range) {
        // 選択がない場合は全文に適用
        const full = document.createRange();
        full.selectNodeContents(editorRef.current);
        range = full;
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(full);
      }

      try {
        // 選択範囲の情報を保存
        const rangeInfo = {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startContainer: range.startContainer,
          endContainer: range.endContainer,
        };

        formatFn(range);

        // 即座にchangeイベントを発火して更新
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        onChange(newContent);

        // フォーカスを維持
        editorRef.current.focus();
      } catch (error) {
        console.error("Format application failed:", error);
      }
    },
    [isEditing, onChange]
  );

  // ボールド適用（トグル）
  const applyBold = useCallback(() => {
    applyFormatToSelection(() => {
      document.execCommand("bold");
    });
  }, [applyFormatToSelection]);

  // イタリック適用（トグル）
  const applyItalic = useCallback(() => {
    applyFormatToSelection(() => {
      document.execCommand("italic");
    });
  }, [applyFormatToSelection]);

  // アンダーライン適用（トグル）
  const applyUnderline = useCallback(() => {
    applyFormatToSelection(() => {
      document.execCommand("underline");
    });
  }, [applyFormatToSelection]);

  // カラー適用
  const applyColor = useCallback(
    (color: string) => {
      applyFormatToSelection((range) => {
        const contents = range.extractContents();
        const span = document.createElement("span");
        span.style.color = color;
        span.appendChild(contents);
        range.insertNode(span);
      });
      setCurrentColor(color);
    },
    [applyFormatToSelection]
  );

  // 背景色適用
  const applyBackgroundColor = useCallback(
    (color: string) => {
      applyFormatToSelection((range) => {
        const contents = range.extractContents();
        const span = document.createElement("span");
        span.style.backgroundColor = color;
        span.appendChild(contents);
        range.insertNode(span);
      });
      setCurrentBgColor(color);
    },
    [applyFormatToSelection]
  );

  // フォントサイズ適用
  const applyFontSize = useCallback(
    (size: string) => {
      applyFormatToSelection((range) => {
        const contents = range.extractContents();
        const span = document.createElement("span");
        span.style.fontSize = size + "px";
        span.appendChild(contents);
        range.insertNode(span);
      });
      setCurrentFontSize(size);
    },
    [applyFormatToSelection]
  );

  // リンク適用（ブラウザに委ね、選択範囲を保持して作成）
  const applyLink = useCallback(
    (url: string) => {
      if (!url) return;
      applyFormatToSelection(() => {
        document.execCommand("createLink", false, url);
      });
      setShowLinkInput(false);
      setLinkUrl("");
    },
    [applyFormatToSelection]
  );

  // リンクボタンクリック
  const handleLinkClick = useCallback(() => {
    setShowLinkInput(true);
    setLinkUrl("");
  }, []);

  // リンク適用
  const handleLinkSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (linkUrl.trim()) {
          applyLink(linkUrl.trim());
        } else {
          setShowLinkInput(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowLinkInput(false);
        setLinkUrl("");
      }
    },
    [linkUrl, applyLink]
  );

  // フォーマットクリア
  const clearFormatting = useCallback(() => {
    applyFormatToSelection((range) => {
      const textContent = range.toString();
      range.deleteContents();
      range.insertNode(document.createTextNode(textContent));
    });
  }, [applyFormatToSelection]);

  // キーボードイベント
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        finishEditing();
      } else if (e.key === "Escape") {
        e.preventDefault();
        finishEditing();
      }

      // Bold, Italic, Underlineのショートカット
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            applyBold();
            break;
          case "i":
            e.preventDefault();
            applyItalic();
            break;
          case "u":
            e.preventDefault();
            applyUnderline();
            break;
          case "k":
            e.preventDefault();
            // リンク入力を開く（選択は保持）
            setShowLinkInput(true);
            setLinkUrl("");
            break;
        }
      }
    },
    [finishEditing, applyBold, applyItalic, applyUnderline]
  );

  // ツールバー
  const toolbar = showToolbar && isEditing && (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] bg-gray-800 text-white rounded-lg shadow-xl p-2 flex items-center gap-1 border border-gray-600"
      style={{
        top: toolbarPosition.top,
        left: toolbarPosition.left,
      }}
      data-testid="inline-toolbar"
      onMouseDown={() => setIsInteractingToolbar(true)}
      onMouseUp={() => setIsInteractingToolbar(false)}
      onMouseLeave={() => setIsInteractingToolbar(false)}
    >
      {/* フォントサイズ */}
      <select
        value={currentFontSize}
        onChange={(e) => applyFontSize(e.target.value)}
        className="text-xs bg-gray-700 text-white border-none rounded px-1 py-1 mr-1"
        style={{ minWidth: "50px" }}
        data-testid="font-size-select"
      >
        {["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48"].map(
          (size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          )
        )}
      </select>

      {/* 文字色 */}
      <div className="relative">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => applyColor(e.target.value)}
          className="w-6 h-6 border-none cursor-pointer rounded"
          title="文字色"
        />
      </div>

      {/* 背景色 */}
      <div className="relative">
        <input
          type="color"
          value={currentBgColor === "transparent" ? "#ffffff" : currentBgColor}
          onChange={(e) => applyBackgroundColor(e.target.value)}
          className="w-6 h-6 border-none cursor-pointer rounded"
          title="背景色"
        />
      </div>

      <div className="w-px h-4 bg-gray-600 mx-1"></div>

      {/* フォーマットボタン */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyBold();
        }}
        className="p-1 hover:bg-gray-700 rounded text-sm font-bold"
        title="太字 (Ctrl+B)"
      >
        <Bold size={14} />
      </button>

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyItalic();
        }}
        className="p-1 hover:bg-gray-700 rounded text-sm italic"
        title="斜体 (Ctrl+I)"
      >
        <Italic size={14} />
      </button>

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          applyUnderline();
        }}
        className="p-1 hover:bg-gray-700 rounded text-sm underline"
        title="下線 (Ctrl+U)"
      >
        <Underline size={14} />
      </button>

      <div className="w-px h-4 bg-gray-600 mx-1"></div>

      {/* リンク */}
      {!showLinkInput ? (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleLinkClick();
          }}
          className="p-1 hover:bg-gray-700 rounded text-sm"
          title="リンクを追加"
          data-testid="link-button"
        >
          <Link size={14} />
        </button>
      ) : (
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={handleLinkSubmit}
          onBlur={() => setShowLinkInput(false)}
          placeholder="URLを入力"
          className="px-2 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded"
          style={{ width: "120px" }}
          autoFocus
          data-testid="link-input"
        />
      )}

      <div className="w-px h-4 bg-gray-600 mx-1"></div>

      {/* フォーマットクリア */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          clearFormatting();
        }}
        className="p-1 hover:bg-gray-700 rounded text-xs"
        title="フォーマットをクリア"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );

  // 入力処理
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  }, [onChange]);

  return (
    <div className="relative">
      {/* エディター */}
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onMouseDown={() => {
          // マウス操作の最初のダウンで編集モードに入り、ドラッグ選択を阻害しない
          if (!isEditing) setIsEditing(true);
        }}
        onClick={startEditing}
        onBlur={finishEditing}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBeforeInput={(e) => {
          // 非編集中は入力をブロック（選択は可能）
          if (!isEditing) e.preventDefault();
        }}
        style={{
          ...style,
          outline: isEditing ? "2px solid #3b82f6" : "none",
          cursor: isEditing ? "text" : "pointer",
          minHeight: "24px",
          position: "relative",
        }}
        className={`${className} ${
          isEditing ? "bg-blue-50" : ""
        } transition-all duration-200`}
        {...(!isEditing
          ? { dangerouslySetInnerHTML: { __html: content } }
          : {})}
      />

      {/* ツールバー */}
      {toolbar}

      {/* 編集中のヒント */}
      {isEditing && (
        <div className="absolute -bottom-8 left-0 text-xs text-gray-500 whitespace-nowrap z-20 bg-white px-2 py-1 rounded shadow">
          📝 テキストを選択してフォーマット • Ctrl+Enter: 完了 • Esc: キャンセル
        </div>
      )}
    </div>
  );
}
