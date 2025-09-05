"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Type,
  Palette,
  Layout,
  Link,
  Smartphone,
  Monitor,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  order: number;
}

interface PropertiesPanelProps {
  component: EmailComponent;
  onUpdate: (data: any) => void;
}

export const PropertiesPanel = React.memo(function PropertiesPanel({
  component,
  onUpdate,
}: PropertiesPanelProps) {
  const handleChange = (key: string, value: any) => {
    onUpdate({ ...component.data, [key]: value });
  };

  // デバウンス用カスタムフック
  const useDebouncedUpdate = (
    initialValue: string,
    key: string,
    delay: number = 300
  ) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
      const handler = setTimeout(() => {
        if (value !== initialValue) {
          handleChange(key, value);
        }
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay, key, initialValue]);

    return [value, setValue] as const;
  };

  // デバウンス付きテキストインプット
  const DebouncedTextInput = ({
    label,
    initialValue,
    onChange,
    placeholder,
    className,
    rows,
  }: any) => {
    const [value, setValue] = useState(initialValue || "");

    useEffect(() => {
      setValue(initialValue || "");
    }, [initialValue]);

    useEffect(() => {
      const handler = setTimeout(() => {
        if (value !== initialValue && onChange) {
          onChange(value);
        }
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }, [value, onChange, initialValue]);

    const InputComponent = rows ? Textarea : Input;

    return (
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <InputComponent
          value={value}
          onChange={(e: any) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`mt-2 ${className || ""}`}
          rows={rows}
        />
      </div>
    );
  };

  const ColorInput = ({ label, value, onChange }: any) => {
    const [inputValue, setInputValue] = useState(value || "#000000");

    useEffect(() => {
      setInputValue(value || "#000000");
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 有効な色かチェック（簡易チェック）
      if (newValue.match(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/)) {
        onChange(newValue);
      }
    };

    const handleTextBlur = () => {
      // 無効な色の場合は元の値に戻す
      if (!inputValue.match(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/)) {
        setInputValue(value || "#000000");
      }
    };

    const handleColorPickerChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="grid grid-cols-[auto,1fr] gap-3 items-center">
          <input
            id={`color-${label}`}
            type="color"
            value={inputValue}
            onChange={handleColorPickerChange}
            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
            title="色を選択"
          />
          <Input
            type="text"
            value={inputValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            className="font-mono text-sm min-w-0"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </div>
    );
  };

  const NumberInput = ({
    label,
    value,
    unit = "px",
    min = 0,
    max = 100,
    onChange,
  }: any) => {
    // 値を数値として抽出
    const extractedValue = React.useMemo(() => {
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
        return isNaN(parsed) ? min : Math.max(min, Math.min(max, parsed));
      }
      return typeof value === "number"
        ? Math.max(min, Math.min(max, value))
        : min;
    }, [value, min, max]);

    const [inputValue, setInputValue] = useState(extractedValue.toString());
    const [isFocused, setIsFocused] = useState(false);

    // Props の変更時にローカル状態を更新（フォーカス中は除く）
    useEffect(() => {
      if (!isFocused) {
        setInputValue(extractedValue.toString());
      }
    }, [extractedValue, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // 即座に有効な数値の場合は更新
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue >= min && numValue <= max) {
        onChange(unit ? `${numValue}${unit}` : numValue);
      }
    };

    const handleInputFocus = () => {
      setIsFocused(true);
    };

    const handleInputBlur = () => {
      setIsFocused(false);
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        setInputValue(clampedValue.toString());
        onChange(unit ? `${clampedValue}${unit}` : clampedValue);
      } else {
        // 無効な値の場合は元に戻す
        setInputValue(extractedValue.toString());
      }
    };

    const handleSliderChange = ([val]: number[]) => {
      if (!isFocused) {
        setInputValue(val.toString());
        onChange(unit ? `${val}${unit}` : val);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <span className="text-xs text-gray-500 font-mono">
            {extractedValue}
            {unit}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            className="w-16 text-sm text-center"
            placeholder={min.toString()}
          />
          <div className="flex-1">
            <Slider
              value={[extractedValue]}
              onValueChange={handleSliderChange}
              min={min}
              max={max}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  };

  const SelectInput = ({ label, value, options, onChange }: any) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
          {options.map((opt: any) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="hover:bg-gray-50"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const SwitchInput = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  const SectionHeader = ({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: any;
  }) => (
    <div className="flex items-center space-x-2 py-3 px-1">
      <div className="p-1 rounded-md bg-blue-50">
        <Icon size={16} className="text-blue-600" />
      </div>
      <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
    </div>
  );

  // リッチテキストエディタ用のフォーマットツールバー
  const RichTextToolbar = ({
    onFormat,
    editorRef,
  }: {
    onFormat: (command: string, value?: string) => void;
    editorRef: React.RefObject<HTMLDivElement>;
  }) => {
    const applyFormat = (command: string, value?: string) => {
      const editor = editorRef.current;

      if (!editor) {
        console.error("Editor element not found");
        return;
      }

      editor.focus();

      try {
        // 選択範囲を保持
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          // 選択範囲がない場合、エディター全体を選択
          const range = document.createRange();
          range.selectNodeContents(editor);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }

        // 基本的なフォーマットはexecCommandを使用
        const success = document.execCommand(command, false, value);

        if (success) {
          // フォーマット適用後に内容を即座に保存
          setTimeout(() => {
            const newContent = editor.innerHTML;
            const newText = editor.textContent || "";
            console.log("Format applied successfully:", command, value);
            console.log("Updated HTML:", newContent);

            // 直接handleChangeを呼んで状態を更新
            handleChange("richText", newContent);
            handleChange("text", newText);
          }, 10);
        } else {
          console.warn("execCommand failed for:", command, value);
          // execCommandが失敗した場合の代替処理
          if (command === "bold") {
            wrapSelectedText("strong");
          } else if (command === "italic") {
            wrapSelectedText("em");
          } else if (command === "underline") {
            wrapSelectedText("u");
          } else if (command === "foreColor") {
            wrapSelectedTextWithStyle("color", value);
          }
        }
      } catch (error) {
        console.error("フォーマットコマンドの実行に失敗:", error);
      }
    };

    const wrapSelectedText = (tagName: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();

      const wrapper = document.createElement(tagName);
      wrapper.appendChild(selectedText);
      range.insertNode(wrapper);

      // 選択を解除
      selection.removeAllRanges();

      // 内容を更新
      setTimeout(() => {
        const newContent = editor.innerHTML;
        const newText = editor.textContent || "";
        handleChange("richText", newContent);
        handleChange("text", newText);
      }, 10);
    };

    const wrapSelectedTextWithStyle = (styleProp: string, value?: string) => {
      const editor = editorRef.current;
      if (!editor || !value) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();

      const wrapper = document.createElement("span");
      wrapper.style.setProperty(styleProp, value);
      wrapper.appendChild(selectedText);
      range.insertNode(wrapper);

      // 選択を解除
      selection.removeAllRanges();

      // 内容を更新
      setTimeout(() => {
        const newContent = editor.innerHTML;
        const newText = editor.textContent || "";
        handleChange("richText", newContent);
        handleChange("text", newText);
      }, 10);
    };

    return (
      <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white shadow-sm">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("bold");
          }}
          title="太字"
        >
          <Bold size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("italic");
          }}
          title="斜体"
        >
          <Italic size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("underline");
          }}
          title="下線"
        >
          <Underline size={14} />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <input
          type="color"
          className="w-8 h-8 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
          onChange={(e) => applyFormat("foreColor", e.target.value)}
          title="文字色"
        />
      </div>
    );
  };

  // リッチテキストエディタコンポーネント
  const RichTextEditor = ({
    componentId,
    initialContent,
    fontFamily,
    lineHeight,
    onChange,
  }: any) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastContentRef = useRef(initialContent);

    // 初期化時のみ内容を設定
    useEffect(() => {
      if (editorRef.current && !isInitialized) {
        editorRef.current.innerHTML = initialContent;
        lastContentRef.current = initialContent;
        setIsInitialized(true);
      }
    }, [initialContent, isInitialized]);

    // 外部からの変更があった場合のみ更新（フォーカス中は除く）
    useEffect(() => {
      if (
        editorRef.current &&
        isInitialized &&
        initialContent !== lastContentRef.current
      ) {
        const isEditorFocused = document.activeElement === editorRef.current;
        if (!isEditorFocused) {
          editorRef.current.innerHTML = initialContent;
          lastContentRef.current = initialContent;
        }
      }
    }, [initialContent, isInitialized]);

    const handleBlur = () => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        const text = editorRef.current.textContent || "";
        lastContentRef.current = html;
        onChange(html, text);
      }
    };

    const handleInput = () => {
      // フォーマット変更をリアルタイムで追跡
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        const text = editorRef.current.textContent || "";
        lastContentRef.current = html;
      }
    };

    return (
      <div
        ref={editorRef}
        id={`rich-editor-${componentId}`}
        contentEditable
        className="min-h-[100px] p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        style={{
          fontFamily,
          lineHeight,
        }}
        onInput={handleInput}
        onBlur={handleBlur}
        suppressContentEditableWarning={true}
      />
    );
  };

  // キャンバス編集案内（メイン編集はキャンバス上で行う）
  const AdvancedRichTextEditor = ({
    componentId,
    initialContent,
    onChange,
    currentFontSize,
  }: any) => {
    return (
      <div>
        <Label className="text-sm font-medium mb-3">📝 キャンバス編集</Label>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-blue-700 text-sm font-medium mb-2">
            ✨
            より直感的な編集のため、キャンバス上でテキストをクリックしてください
          </div>
          <div className="text-blue-600 text-xs space-y-1">
            <div>• 部分テキスト選択</div>
            <div>• フォントサイズ・色・背景色の変更</div>
            <div>• 太字・斜体・下線・リンクの適用</div>
            <div>• リアルタイムプレビュー</div>
          </div>
        </div>

        {/* 現在のコンテンツプレビュー */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="text-xs text-gray-500 mb-1">プレビュー:</div>
          <div
            dangerouslySetInnerHTML={{
              __html: initialContent || "テキストを入力してください",
            }}
            className="text-sm"
          />
        </div>
      </div>
    );
  };

  const renderComponentProperties = () => {
    switch (component.type) {
      case "text":
        // ダミーハンドラー（実際の処理はツールバー内で完結）
        const handleRichTextFormat = () => {
          // ツールバー内で直接handleChangeを呼ぶので、ここでは何もしない
        };

        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="テキスト設定" icon={Type} />
              <div className="space-y-5 mt-4">
                <AdvancedRichTextEditor
                  componentId={component.id}
                  initialContent={
                    component.data.richText ||
                    component.data.text ||
                    "テキストを入力してください"
                  }
                  currentFontSize={component.data.fontSize || "16px"}
                  onChange={(html: string, text: string) => {
                    handleChange("richText", html);
                    handleChange("text", text);
                  }}
                />
                <SelectInput
                  label="フォント"
                  value={component.data.fontFamily || "Arial, sans-serif"}
                  options={[
                    { value: "Arial, sans-serif", label: "Arial" },
                    { value: "Georgia, serif", label: "Georgia" },
                    {
                      value: "Times New Roman, serif",
                      label: "Times New Roman",
                    },
                    {
                      value: "Helvetica, Arial, sans-serif",
                      label: "Helvetica",
                    },
                    { value: "Verdana, sans-serif", label: "Verdana" },
                  ]}
                  onChange={(v: string) => handleChange("fontFamily", v)}
                />
                <NumberInput
                  label="フォントサイズ"
                  value={component.data.fontSize || "16px"}
                  unit="px"
                  min={10}
                  max={48}
                  onChange={(v: string) => handleChange("fontSize", v)}
                />
                <NumberInput
                  label="行間"
                  value={component.data.lineHeight || "1.4"}
                  unit=""
                  min={1}
                  max={3}
                  onChange={(v: string) =>
                    handleChange("lineHeight", parseFloat(v).toFixed(1))
                  }
                />
                <ColorInput
                  label="文字色"
                  value={component.data.color || "#000000"}
                  onChange={(v: string) => handleChange("color", v)}
                />
                <SelectInput
                  label="文字の太さ"
                  value={component.data.fontWeight || "normal"}
                  options={[
                    { value: "300", label: "Light" },
                    { value: "normal", label: "Normal" },
                    { value: "500", label: "Medium" },
                    { value: "600", label: "Semi Bold" },
                    { value: "bold", label: "Bold" },
                  ]}
                  onChange={(v: string) => handleChange("fontWeight", v)}
                />
                <SelectInput
                  label="テキスト揃え"
                  value={component.data.textAlign || "left"}
                  options={[
                    { value: "left", label: "左揃え" },
                    { value: "center", label: "中央揃え" },
                    { value: "right", label: "右揃え" },
                    { value: "justify", label: "両端揃え" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <SectionHeader title="リンク設定" icon={Link} />
              <div className="space-y-4 mt-3">
                <SwitchInput
                  label="リンクを有効にする"
                  checked={component.data.isLink || false}
                  onChange={(checked: boolean) =>
                    handleChange("isLink", checked)
                  }
                  description="テキスト全体にリンクを設定します"
                />
                {component.data.isLink && (
                  <>
                    <DebouncedTextInput
                      label="リンクURL"
                      initialValue={component.data.linkUrl || ""}
                      onChange={(value: string) =>
                        handleChange("linkUrl", value)
                      }
                      placeholder="https://example.com"
                    />
                    <ColorInput
                      label="リンク色"
                      value={component.data.linkColor || "#007bff"}
                      onChange={(v: string) => handleChange("linkColor", v)}
                    />
                    <SwitchInput
                      label="下線を表示"
                      checked={component.data.linkUnderline !== false}
                      onChange={(checked: boolean) =>
                        handleChange("linkUnderline", checked)
                      }
                    />
                    <SelectInput
                      label="リンクの開き方"
                      value={component.data.linkTarget || "_blank"}
                      options={[
                        { value: "_blank", label: "新しいタブで開く" },
                        { value: "_self", label: "同じタブで開く" },
                      ]}
                      onChange={(v: string) => handleChange("linkTarget", v)}
                    />
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <SectionHeader title="スタイル設定" icon={Palette} />
              <div className="space-y-4 mt-3">
                <ColorInput
                  label="背景色"
                  value={component.data.backgroundColor || "transparent"}
                  onChange={(v: string) => handleChange("backgroundColor", v)}
                />
                <NumberInput
                  label="内側余白"
                  value={component.data.padding || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("padding", v)}
                />
                <NumberInput
                  label="外側余白"
                  value={component.data.margin || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("margin", v)}
                />
                <NumberInput
                  label="角の丸み"
                  value={component.data.borderRadius || "0px"}
                  unit="px"
                  min={0}
                  max={20}
                  onChange={(v: string) => handleChange("borderRadius", v)}
                />
                <SwitchInput
                  label="枠線を表示"
                  checked={component.data.showBorder || false}
                  onChange={(checked: boolean) =>
                    handleChange("showBorder", checked)
                  }
                />
                {component.data.showBorder && (
                  <>
                    <ColorInput
                      label="枠線の色"
                      value={component.data.borderColor || "#d1d5db"}
                      onChange={(v: string) => handleChange("borderColor", v)}
                    />
                    <NumberInput
                      label="枠線の太さ"
                      value={component.data.borderWidth || "1px"}
                      unit="px"
                      min={1}
                      max={5}
                      onChange={(v: string) => handleChange("borderWidth", v)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "button":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="ボタン設定" icon={Type} />
              <div className="space-y-4 mt-3">
                <DebouncedTextInput
                  label="ボタンテキスト"
                  initialValue={component.data.text || ""}
                  onChange={(value: string) => handleChange("text", value)}
                />
                <DebouncedTextInput
                  label="リンクURL"
                  initialValue={component.data.url || ""}
                  onChange={(value: string) => handleChange("url", value)}
                  placeholder="https://example.com"
                />
                <ColorInput
                  label="背景色"
                  value={component.data.backgroundColor || "#007bff"}
                  onChange={(v: string) => handleChange("backgroundColor", v)}
                />
                <ColorInput
                  label="文字色"
                  value={component.data.color || "#ffffff"}
                  onChange={(v: string) => handleChange("color", v)}
                />
                <NumberInput
                  label="フォントサイズ"
                  value={component.data.fontSize || "16px"}
                  unit="px"
                  min={10}
                  max={32}
                  onChange={(v: string) => handleChange("fontSize", v)}
                />
                <NumberInput
                  label="角の丸み"
                  value={component.data.borderRadius || "4px"}
                  unit="px"
                  min={0}
                  max={20}
                  onChange={(v: string) => handleChange("borderRadius", v)}
                />
                <SelectInput
                  label="配置"
                  value={component.data.textAlign || "center"}
                  options={[
                    { value: "left", label: "左" },
                    { value: "center", label: "中央" },
                    { value: "right", label: "右" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
                <SelectInput
                  label="フォント"
                  value={component.data.fontFamily || "Arial, sans-serif"}
                  options={[
                    { value: "Arial, sans-serif", label: "Arial" },
                    { value: "Georgia, serif", label: "Georgia" },
                    {
                      value: "Times New Roman, serif",
                      label: "Times New Roman",
                    },
                    {
                      value: "Helvetica, Arial, sans-serif",
                      label: "Helvetica",
                    },
                    { value: "Verdana, sans-serif", label: "Verdana" },
                  ]}
                  onChange={(v: string) => handleChange("fontFamily", v)}
                />
                <SelectInput
                  label="文字の太さ"
                  value={component.data.fontWeight || "normal"}
                  options={[
                    { value: "300", label: "Light" },
                    { value: "normal", label: "Normal" },
                    { value: "500", label: "Medium" },
                    { value: "600", label: "Semi Bold" },
                    { value: "bold", label: "Bold" },
                  ]}
                  onChange={(v: string) => handleChange("fontWeight", v)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <SectionHeader title="スタイル設定" icon={Palette} />
              <div className="space-y-4 mt-3">
                <NumberInput
                  label="内側余白"
                  value={component.data.padding || "8px"}
                  unit="px"
                  min={4}
                  max={30}
                  onChange={(v: string) => handleChange("padding", v)}
                />
                <NumberInput
                  label="外側余白"
                  value={component.data.margin || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("margin", v)}
                />
                <NumberInput
                  label="幅"
                  value={component.data.width || "200px"}
                  unit="px"
                  min={100}
                  max={600}
                  onChange={(v: string) => handleChange("width", v)}
                />
                <SwitchInput
                  label="枠線を表示"
                  checked={component.data.showBorder || false}
                  onChange={(checked: boolean) =>
                    handleChange("showBorder", checked)
                  }
                />
                {component.data.showBorder && (
                  <>
                    <ColorInput
                      label="枠線の色"
                      value={component.data.borderColor || "#d1d5db"}
                      onChange={(v: string) => handleChange("borderColor", v)}
                    />
                    <NumberInput
                      label="枠線の太さ"
                      value={component.data.borderWidth || "1px"}
                      unit="px"
                      min={1}
                      max={5}
                      onChange={(v: string) => handleChange("borderWidth", v)}
                    />
                  </>
                )}
                <NumberInput
                  label="影の強さ"
                  value={component.data.boxShadowIntensity || "0"}
                  unit=""
                  min={0}
                  max={20}
                  onChange={(v: string) =>
                    handleChange(
                      "boxShadow",
                      v === "0"
                        ? "none"
                        : `0 ${v}px ${Math.round(
                            parseInt(v) * 2
                          )}px rgba(0,0,0,0.1)`
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="画像設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <DebouncedTextInput
                  label="画像URL"
                  initialValue={component.data.src || ""}
                  onChange={(value: string) => handleChange("src", value)}
                  placeholder="https://example.com/image.jpg"
                />
                <DebouncedTextInput
                  label="代替テキスト"
                  initialValue={component.data.alt || ""}
                  onChange={(value: string) => handleChange("alt", value)}
                  placeholder="画像の説明"
                />
                <SelectInput
                  label="幅"
                  value={component.data.width || "100%"}
                  options={[
                    { value: "100%", label: "幅いっぱい" },
                    { value: "75%", label: "75%" },
                    { value: "50%", label: "50%" },
                    { value: "25%", label: "25%" },
                    { value: "auto", label: "自動" },
                  ]}
                  onChange={(v: string) => handleChange("width", v)}
                />
                <NumberInput
                  label="最大幅"
                  value={component.data.maxWidth || "600px"}
                  unit="px"
                  min={100}
                  max={1000}
                  onChange={(v: string) => handleChange("maxWidth", v)}
                />
                <SelectInput
                  label="配置"
                  value={component.data.textAlign || "center"}
                  options={[
                    { value: "left", label: "左" },
                    { value: "center", label: "中央" },
                    { value: "right", label: "右" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
                <NumberInput
                  label="角の丸み"
                  value={component.data.borderRadius || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("borderRadius", v)}
                />
                <SwitchInput
                  label="リンクを設定"
                  checked={component.data.isLink || false}
                  onChange={(checked: boolean) =>
                    handleChange("isLink", checked)
                  }
                  description="画像をクリック可能にします"
                />
                {component.data.isLink && (
                  <DebouncedTextInput
                    label="リンクURL"
                    initialValue={component.data.linkUrl || ""}
                    onChange={(value: string) => handleChange("linkUrl", value)}
                    placeholder="https://example.com"
                  />
                )}
              </div>
            </div>

            <Separator />

            <div>
              <SectionHeader title="スタイル設定" icon={Palette} />
              <div className="space-y-4 mt-3">
                <NumberInput
                  label="内側余白"
                  value={component.data.padding || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("padding", v)}
                />
                <NumberInput
                  label="外側余白"
                  value={component.data.margin || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("margin", v)}
                />
                <SwitchInput
                  label="枠線を表示"
                  checked={component.data.showBorder || false}
                  onChange={(checked: boolean) =>
                    handleChange("showBorder", checked)
                  }
                />
                {component.data.showBorder && (
                  <>
                    <ColorInput
                      label="枠線の色"
                      value={component.data.borderColor || "#d1d5db"}
                      onChange={(v: string) => handleChange("borderColor", v)}
                    />
                    <NumberInput
                      label="枠線の太さ"
                      value={component.data.borderWidth || "1px"}
                      unit="px"
                      min={1}
                      max={10}
                      onChange={(v: string) => handleChange("borderWidth", v)}
                    />
                  </>
                )}
                <NumberInput
                  label="影の強さ"
                  value={component.data.boxShadowIntensity || "0"}
                  unit=""
                  min={0}
                  max={20}
                  onChange={(v: string) =>
                    handleChange(
                      "boxShadow",
                      v === "0"
                        ? "none"
                        : `0 ${v}px ${Math.round(
                            parseInt(v) * 2
                          )}px rgba(0,0,0,0.1)`
                    )
                  }
                />
                <ColorInput
                  label="背景色"
                  value={component.data.backgroundColor || "transparent"}
                  onChange={(v: string) => handleChange("backgroundColor", v)}
                />
              </div>
            </div>
          </div>
        );

      case "divider":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="区切り線設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <NumberInput
                  label="線の太さ"
                  value={component.data.height || "1px"}
                  unit="px"
                  min={1}
                  max={10}
                  onChange={(v: string) => handleChange("height", v)}
                />
                <ColorInput
                  label="線の色"
                  value={component.data.color || "#e5e7eb"}
                  onChange={(v: string) => handleChange("color", v)}
                />
                <SelectInput
                  label="線のスタイル"
                  value={component.data.borderStyle || "solid"}
                  options={[
                    { value: "solid", label: "実線" },
                    { value: "dashed", label: "点線" },
                    { value: "dotted", label: "点々" },
                    { value: "double", label: "二重線" },
                  ]}
                  onChange={(v: string) => handleChange("borderStyle", v)}
                />
                <NumberInput
                  label="幅"
                  value={component.data.width || "100%"}
                  unit="%"
                  min={10}
                  max={100}
                  onChange={(v: string) => handleChange("width", `${v}%`)}
                />
                <SelectInput
                  label="配置"
                  value={component.data.textAlign || "center"}
                  options={[
                    { value: "left", label: "左" },
                    { value: "center", label: "中央" },
                    { value: "right", label: "右" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
                <NumberInput
                  label="上下の余白"
                  value={component.data.margin || "12px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("margin", v)}
                />
              </div>
            </div>
          </div>
        );

      case "spacer":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="スペーサー設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <NumberInput
                  label="高さ"
                  value={component.data.height || "20px"}
                  unit="px"
                  min={5}
                  max={200}
                  onChange={(v: string) => handleChange("height", v)}
                />
              </div>
            </div>
          </div>
        );

      case "header":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="ヘッダー設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <DebouncedTextInput
                  label="タイトル"
                  initialValue={component.data.title || ""}
                  onChange={(value: string) => handleChange("title", value)}
                />
                <DebouncedTextInput
                  label="サブタイトル"
                  initialValue={component.data.subtitle || ""}
                  onChange={(value: string) => handleChange("subtitle", value)}
                />
                <NumberInput
                  label="タイトルサイズ"
                  value={component.data.fontSize || "28px"}
                  unit="px"
                  min={16}
                  max={48}
                  onChange={(v: string) => handleChange("fontSize", v)}
                />
                <ColorInput
                  label="文字色"
                  value={component.data.color || "#000000"}
                  onChange={(v: string) => handleChange("color", v)}
                />
                <ColorInput
                  label="背景色"
                  value={component.data.backgroundColor || "#f8f9fa"}
                  onChange={(v: string) => handleChange("backgroundColor", v)}
                />
                <SelectInput
                  label="テキスト揃え"
                  value={component.data.textAlign || "center"}
                  options={[
                    { value: "left", label: "左揃え" },
                    { value: "center", label: "中央揃え" },
                    { value: "right", label: "右揃え" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
                <SelectInput
                  label="フォント"
                  value={component.data.fontFamily || "Arial, sans-serif"}
                  options={[
                    { value: "Arial, sans-serif", label: "Arial" },
                    { value: "Georgia, serif", label: "Georgia" },
                    {
                      value: "Times New Roman, serif",
                      label: "Times New Roman",
                    },
                    {
                      value: "Helvetica, Arial, sans-serif",
                      label: "Helvetica",
                    },
                    { value: "Verdana, sans-serif", label: "Verdana" },
                  ]}
                  onChange={(v: string) => handleChange("fontFamily", v)}
                />
                <SelectInput
                  label="文字の太さ"
                  value={component.data.fontWeight || "600"}
                  options={[
                    { value: "300", label: "Light" },
                    { value: "normal", label: "Normal" },
                    { value: "500", label: "Medium" },
                    { value: "600", label: "Semi Bold" },
                    { value: "bold", label: "Bold" },
                  ]}
                  onChange={(v: string) => handleChange("fontWeight", v)}
                />
                <NumberInput
                  label="サブタイトルサイズ"
                  value={component.data.subtitleSize || "16px"}
                  unit="px"
                  min={12}
                  max={28}
                  onChange={(v: string) => handleChange("subtitleSize", v)}
                />
                <ColorInput
                  label="サブタイトル色"
                  value={component.data.subtitleColor || "#6b7280"}
                  onChange={(v: string) => handleChange("subtitleColor", v)}
                />
                <NumberInput
                  label="内側余白"
                  value={component.data.padding || "30px"}
                  unit="px"
                  min={10}
                  max={80}
                  onChange={(v: string) => handleChange("padding", v)}
                />
                <NumberInput
                  label="外側余白"
                  value={component.data.margin || "0px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("margin", v)}
                />
                <SwitchInput
                  label="枠線を表示"
                  checked={component.data.showBorder || false}
                  onChange={(checked: boolean) =>
                    handleChange("showBorder", checked)
                  }
                />
                {component.data.showBorder && (
                  <>
                    <ColorInput
                      label="枠線の色"
                      value={component.data.borderColor || "#d1d5db"}
                      onChange={(v: string) => handleChange("borderColor", v)}
                    />
                    <NumberInput
                      label="枠線の太さ"
                      value={component.data.borderWidth || "1px"}
                      unit="px"
                      min={1}
                      max={5}
                      onChange={(v: string) => handleChange("borderWidth", v)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "footer":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="フッター設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <DebouncedTextInput
                  label="フッター内容"
                  initialValue={component.data.content || ""}
                  onChange={(value: string) => handleChange("content", value)}
                  rows={3}
                />
                <ColorInput
                  label="文字色"
                  value={component.data.color || "#6b7280"}
                  onChange={(v: string) => handleChange("color", v)}
                />
                <ColorInput
                  label="背景色"
                  value={component.data.backgroundColor || "#f3f4f6"}
                  onChange={(v: string) => handleChange("backgroundColor", v)}
                />
                <SelectInput
                  label="テキスト揃え"
                  value={component.data.textAlign || "center"}
                  options={[
                    { value: "left", label: "左揃え" },
                    { value: "center", label: "中央揃え" },
                    { value: "right", label: "右揃え" },
                  ]}
                  onChange={(v: string) => handleChange("textAlign", v)}
                />
              </div>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="ソーシャルリンク設定" icon={Link} />
              <div className="space-y-4 mt-3">
                {["facebook", "twitter", "instagram", "linkedin"].map(
                  (platform) => (
                    <DebouncedTextInput
                      key={platform}
                      label={`${
                        platform.charAt(0).toUpperCase() + platform.slice(1)
                      } URL`}
                      initialValue={component.data[`${platform}Url`] || ""}
                      onChange={(value: string) =>
                        handleChange(`${platform}Url`, value)
                      }
                      placeholder={`https://${platform}.com`}
                    />
                  )
                )}
                <SelectInput
                  label="配置"
                  value={component.data.alignment || "center"}
                  options={[
                    { value: "left", label: "左" },
                    { value: "center", label: "中央" },
                    { value: "right", label: "右" },
                  ]}
                  onChange={(v: string) => handleChange("alignment", v)}
                />
              </div>
            </div>
          </div>
        );

      case "html":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="HTML設定" icon={Type} />
              <div className="space-y-4 mt-3">
                <DebouncedTextInput
                  label="HTMLコード"
                  initialValue={component.data.content || ""}
                  onChange={(value: string) => handleChange("content", value)}
                  className="font-mono text-sm"
                  rows={6}
                  placeholder="<p>HTMLコードを入力してください</p>"
                />
              </div>
            </div>
          </div>
        );

      case "columns":
        return (
          <div className="space-y-6">
            <div>
              <SectionHeader title="列レイアウト設定" icon={Layout} />
              <div className="space-y-4 mt-3">
                <SelectInput
                  label="列数"
                  value={component.data.columnCount?.toString() || "2"}
                  options={[
                    { value: "1", label: "1列" },
                    { value: "2", label: "2列" },
                    { value: "3", label: "3列" },
                    { value: "4", label: "4列" },
                  ]}
                  onChange={(v: string) => {
                    const newColumnCount = parseInt(v);
                    const updatedData = {
                      ...component.data,
                      columnCount: newColumnCount,
                    };

                    // 新しい列にcomponents配列を初期化
                    for (let i = 1; i <= newColumnCount; i++) {
                      if (!updatedData[`column${i}`]) {
                        updatedData[`column${i}`] = { components: [] };
                      } else if (!updatedData[`column${i}`].components) {
                        updatedData[`column${i}`].components = [];
                      }
                    }

                    onUpdate(updatedData);
                  }}
                />
                <NumberInput
                  label="列間隔"
                  value={component.data.gap || "20px"}
                  unit="px"
                  min={0}
                  max={50}
                  onChange={(v: string) => handleChange("gap", v)}
                />
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <p className="font-medium mb-1">💡 ヒント:</p>
                  <p>
                    左のコンポーネントライブラリから、列の中にコンポーネントをドラッグ&ドロップして追加できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-400">
            <Settings size={32} className="mx-auto mb-2" />
            <p className="text-sm">このコンポーネントの設定は利用できません</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Settings size={20} className="mr-2" />
          プロパティ
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {component.type.toUpperCase()} コンポーネント
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-1">{renderComponentProperties()}</div>
      </div>

      {/* レスポンシブプレビュー */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <h3 className="text-sm font-semibold mb-3 flex items-center">
          <Monitor size={16} className="mr-2" />
          レスポンシブ設定
        </h3>
        <div className="text-xs text-gray-500">
          <p>• デスクトップ: 600px 幅での表示</p>
          <p>• モバイル: 375px 幅での表示</p>
        </div>
      </div>
    </div>
  );
});
