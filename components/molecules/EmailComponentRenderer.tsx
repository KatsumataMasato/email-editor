"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2, GripVertical } from "lucide-react";
import { ImageComponent } from "../atoms/ImageComponent";
import { InlineRichTextEditor } from "../atoms/InlineRichTextEditor";

interface EmailComponent {
  id: string;
  type: string;
  data: any;
  order: number;
}

interface EmailComponentRendererProps {
  component: EmailComponent;
  isSelected: boolean;
  viewMode: "desktop" | "mobile";
  onSelect: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  selectedColumnComponentId?: string | null;
}

// 列内のコンポーネントをレンダリングする関数（読み取り専用）
const renderColumnComponent = (columnComponent: any, isMobile: boolean) => {
  switch (columnComponent.type) {
    case "text":
      const columnTextStyle = {
        fontSize: isMobile ? "12px" : "14px",
        color: columnComponent.data?.color || "#374151",
        textAlign: columnComponent.data?.textAlign || "left",
        lineHeight: "1.4",
        padding: "4px 0",
      };

      return (
        <InlineRichTextEditor
          initialContent={
            columnComponent.data?.richText ||
            columnComponent.data?.text ||
            "テキストを入力してください"
          }
          onChange={(newContent) => {
            // 列コンポーネントの更新は親コンポーネントで処理
            console.log("Column text updated:", newContent);
          }}
          style={columnTextStyle}
          className="w-full"
        />
      );
    case "button":
      return (
        <div
          style={{
            display: "inline-block",
            backgroundColor: columnComponent.data?.backgroundColor || "#007bff",
            color: columnComponent.data?.color || "#ffffff",
            padding:
              columnComponent.data?.padding ||
              (isMobile ? "6px 12px" : "8px 16px"),
            margin: columnComponent.data?.margin || "0px",
            borderRadius: columnComponent.data?.borderRadius || "4px",
            fontSize: isMobile
              ? "12px"
              : columnComponent.data?.fontSize || "14px",
            fontFamily: columnComponent.data?.fontFamily || "Arial, sans-serif",
            fontWeight: columnComponent.data?.fontWeight || "normal",
            textAlign: "center",
            cursor: "pointer",
            border: columnComponent.data?.showBorder
              ? `${columnComponent.data?.borderWidth || "1px"} solid ${
                  columnComponent.data?.borderColor || "#d1d5db"
                }`
              : "none",
            boxShadow: columnComponent.data?.boxShadow || "none",
            width: columnComponent.data?.width || "auto",
          }}
        >
          {columnComponent.data?.text || "ボタンテキスト"}
        </div>
      );
    case "image":
      return (
        <div style={{ textAlign: "center" }}>
          {columnComponent.data?.src ? (
            <img
              src={columnComponent.data.src}
              alt={columnComponent.data?.alt || ""}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "4px",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                minHeight: "80px",
                backgroundColor: "#f3f4f6",
                border: "2px dashed #d1d5db",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              <div style={{ marginBottom: "6px" }}>📷</div>
              <div>画像をアップロード</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                クリックして選択
              </div>
            </div>
          )}
        </div>
      );
    case "html":
      return (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            minHeight: "40px",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            backgroundColor: "#f9fafb",
          }}
          dangerouslySetInnerHTML={{
            __html: columnComponent.data?.content || "<p>HTMLコンテンツ</p>",
          }}
        />
      );
    case "divider":
      return (
        <div style={{ padding: isMobile ? "8px 0" : "12px 0" }}>
          <hr
            style={{
              border: "none",
              height: columnComponent.data?.height || "1px",
              backgroundColor: columnComponent.data?.color || "#e5e7eb",
              margin: "0",
              borderRadius: columnComponent.data?.borderRadius || "0px",
            }}
          />
        </div>
      );
    case "header":
      return (
        <div
          style={{
            backgroundColor: columnComponent.data?.backgroundColor || "#f8f9fa",
            padding: isMobile ? "16px 8px" : "20px 12px",
            textAlign: columnComponent.data?.textAlign || "center",
            borderRadius: "4px",
          }}
        >
          <h2
            style={{
              fontSize: isMobile
                ? "16px"
                : columnComponent.data?.fontSize || "20px",
              color: columnComponent.data?.color || "#000000",
              margin: "0",
              fontFamily:
                columnComponent.data?.fontFamily || "Arial, sans-serif",
              fontWeight: columnComponent.data?.fontWeight || "600",
              lineHeight: "1.2",
            }}
          >
            {columnComponent.data?.title || "ヘッダータイトル"}
          </h2>
          {columnComponent.data?.subtitle && (
            <p
              style={{
                fontSize: isMobile ? "12px" : "14px",
                color: columnComponent.data?.subtitleColor || "#6b7280",
                margin: "6px 0 0 0",
                lineHeight: "1.4",
              }}
            >
              {columnComponent.data.subtitle}
            </p>
          )}
        </div>
      );
    case "footer":
      return (
        <div
          style={{
            backgroundColor: columnComponent.data?.backgroundColor || "#f3f4f6",
            padding: isMobile ? "12px 8px" : "16px 12px",
            textAlign: columnComponent.data?.textAlign || "center",
            fontSize: isMobile ? "10px" : "12px",
            color: columnComponent.data?.color || "#6b7280",
            lineHeight: "1.5",
            borderRadius: "4px",
          }}
        >
          {columnComponent.data?.content || "フッター情報"}
        </div>
      );
    default:
      if (columnComponent.type === "spacer") {
        return (
          <div
            style={{
              height: isMobile
                ? "12px"
                : columnComponent.data?.height || "20px",
              backgroundColor: "transparent",
              border: "1px dashed #cbd5e1",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#9ca3af",
              minHeight: "16px",
            }}
          >
            SPACER
          </div>
        );
      }
      return (
        <div
          style={{
            fontSize: isMobile ? "12px" : "14px",
            color: "#6b7280",
            textAlign: "center",
            padding: "8px",
            border: "1px dashed #cbd5e1",
            borderRadius: "4px",
            minHeight: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {columnComponent.type}コンポーネント
        </div>
      );
  }
};

// 列内コンポーネントレンダラー（読み取り専用）
const ColumnComponentRenderer = React.memo(
  ({
    component,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
    isMobile,
  }: {
    component: any;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onUpdate: (id: string, data: any) => void;
    onDelete: () => void;
    isMobile: boolean;
  }) => {
    const [isImageLoading, setIsImageLoading] = useState(false);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: component.id,
      data: { component },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 9999 : isSelected ? 200 : 10,
      position: "relative" as const,
    };

    // 画像アップロード処理（表示のみ）
    const handleImageUpload = async (file: File) => {
      console.log(
        "Column component image upload:",
        file.name,
        file.type,
        file.size
      );
      setIsImageLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Column image upload successful:", data.url);

          const updatedData = {
            ...component.data,
            src: data.url,
            width: component.data.width || (isMobile ? "100%" : "200px"),
            height: component.data.height || "auto",
            alt: component.data.alt || file.name,
          };

          onUpdate(component.id, updatedData);
        } else {
          const errorData = await response.text();
          console.error(
            "Column image upload failed:",
            response.status,
            errorData
          );
        }
      } catch (error) {
        console.error("Column image upload failed:", error);
      } finally {
        setIsImageLoading(false);
      }
    };

    const renderReadOnlyComponent = () => {
      switch (component.type) {
        case "text":
          const columnTextStyle = {
            fontSize: isMobile ? "12px" : "14px",
            color: component.data?.color || "#374151",
            textAlign: component.data?.textAlign || "left",
            lineHeight: "1.4",
            padding: "4px 0",
            minHeight: "20px",
            border: "1px solid transparent",
            borderRadius: "0",
          };

          return (
            <div
              style={columnTextStyle}
              dangerouslySetInnerHTML={{
                __html:
                  component.data.richText ||
                  component.data.text ||
                  "テキストを入力してください",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(component.id);
              }}
              className="cursor-pointer"
            />
          );
        case "button":
          return (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: component.data?.backgroundColor || "#007bff",
                  color: component.data?.color || "#ffffff",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                  borderRadius: "4px",
                  fontSize: isMobile ? "12px" : "14px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: "none",
                  minWidth: isMobile ? "80px" : "100px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(component.id);
                }}
              >
                {component.data?.text || "ボタンテキスト"}
              </div>
            </div>
          );
        case "image":
          return (
            <div
              style={{
                textAlign: component.data?.textAlign || "center",
                padding: "4px",
                overflow: "visible",
                maxWidth: "100%",
                position: "relative",
              }}
            >
              <ImageComponent
                src={component.data?.src}
                alt={component.data?.alt}
                width={isMobile ? "100%" : component.data?.width || "100%"}
                height={component.data?.height || "auto"}
                onUpdate={(data) => {
                  onUpdate(component.id, data);
                }}
                onImageUpload={handleImageUpload}
                isLoading={isImageLoading}
              />
            </div>
          );
        case "spacer":
          return (
            <div
              style={{
                height: isMobile ? "12px" : component.data?.height || "20px",
                backgroundColor: "transparent",
                border: isSelected ? "2px solid #10b981" : "1px dashed #cbd5e1",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: isSelected ? "#10b981" : "#9ca3af",
                minHeight: "20px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(component.id);
              }}
            >
              SPACER ({component.data?.height || "20px"})
            </div>
          );
        default:
          return renderColumnComponent(component, isMobile);
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          zIndex: isSelected ? 20 : isDragging ? 9999 : 1,
        }}
        className={`relative group transition-all duration-200 ${
          isSelected ? "ring-1 ring-blue-400 ring-offset-1" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(component.id);
        }}
      >
        {renderReadOnlyComponent()}

        {/* ツールバー */}
        <div
          className={`absolute ${
            component.type === "image" ? "-top-10 h-10" : "-top-6 h-6"
          } left-0 right-0 bg-blue-500 text-white flex items-center justify-between px-2 transition-all duration-200 rounded-t-sm text-xs z-30 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="flex items-center space-x-1">
            <div
              {...attributes}
              {...listeners}
              className={`${
                component.type === "image" ? "p-2" : "p-0.5"
              } hover:bg-blue-600 rounded cursor-grab active:cursor-grabbing flex items-center border border-white/30 hover:border-white`}
              title={`${
                component.type === "image" ? "画像を" : ""
              }ドラッグして移動`}
              style={
                component.type === "image"
                  ? { minWidth: "36px", minHeight: "28px" }
                  : {}
              }
            >
              <GripVertical size={component.type === "image" ? 14 : 10} />
            </div>
            <span className="font-medium uppercase text-xs">
              {component.type === "image" ? "📷 " : ""}
              {component.type === "columns" ? "2列レイアウト" : component.type}
            </span>
            {component.type === "image" && component.data?.src && (
              <span className="text-xs bg-blue-600 px-1 py-0.5 rounded">
                設定済み
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`${
              component.type === "image" ? "p-2" : "p-0.5"
            } hover:bg-red-500 rounded transition-colors border border-transparent hover:border-white`}
            title="削除"
            style={
              component.type === "image"
                ? { minWidth: "32px", minHeight: "28px" }
                : {}
            }
          >
            <Trash2 size={component.type === "image" ? 12 : 10} />
          </button>
        </div>
      </div>
    );
  }
);

// 列ドロップゾーンコンポーネント
const ColumnDropZone = React.memo(
  ({
    columnId,
    children,
    isEmpty,
    isSelected,
  }: {
    columnId: string;
    children: React.ReactNode;
    isEmpty: boolean;
    isSelected: boolean;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: columnId,
    });

    return (
      <div
        ref={setNodeRef}
        style={{
          border: isSelected ? "1px dashed #cbd5e1" : "1px dashed transparent",
          borderRadius: "4px",
          minHeight: "100px",
          padding: "16px",
          backgroundColor: isOver
            ? "#dbeafe"
            : isSelected
            ? "#f8fafc"
            : "transparent",
          display: "flex",
          alignItems: isEmpty ? "center" : "flex-start",
          justifyContent: isEmpty ? "center" : "flex-start",
          position: "relative",
          flexDirection: "column",
          gap: "12px",
          transition: "all 0.2s ease",
        }}
      >
        {children}
      </div>
    );
  }
);

export function EmailComponentRenderer({
  component,
  isSelected,
  viewMode,
  onSelect,
  onUpdate,
  onDelete,
  selectedColumnComponentId,
}: EmailComponentRendererProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: { component },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 9999 : isSelected ? 200 : 10,
    position: "relative" as const,
  };

  const handleImageUpload = async (file: File) => {
    console.log("Starting image upload:", file.name, file.type, file.size);
    setIsImageLoading(true);
    const isMobileView = viewMode === "mobile";

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending upload request...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful, URL:", data.url);

        const updatedData = {
          ...component.data,
          src: data.url,
          width: component.data.width || (isMobileView ? "100%" : "400px"),
          height: component.data.height || "auto",
          alt: component.data.alt || file.name,
        };

        console.log("Updating image component with data:", updatedData);
        onUpdate(component.id, updatedData);
      } else {
        const errorData = await response.text();
        console.error("Upload failed with status:", response.status, errorData);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const renderComponent = () => {
    const isMobile = viewMode === "mobile";

    switch (component.type) {
      case "text":
        const textStyle = {
          fontSize: isMobile ? "14px" : component.data.fontSize || "16px",
          color:
            component.data.isLink && component.data.linkColor
              ? component.data.linkColor
              : component.data.color || "#000000",
          textAlign: component.data.textAlign || "left",
          fontWeight: component.data.fontWeight || "normal",
          fontFamily: component.data.fontFamily || "Arial, sans-serif",
          lineHeight: component.data.lineHeight || "1.4",
          letterSpacing: component.data.letterSpacing || "normal",
          backgroundColor:
            component.data.backgroundColor !== "transparent"
              ? component.data.backgroundColor
              : undefined,
          padding: component.data.padding
            ? component.data.padding
            : isMobile
            ? "12px 16px"
            : "16px 20px",
          margin: component.data.margin || "0px",
          borderRadius: component.data.borderRadius || "0",
          border: component.data.showBorder
            ? `${component.data.borderWidth || "1px"} solid ${
                component.data.borderColor || "#d1d5db"
              }`
            : "1px solid transparent",
          outline: "none",
          minHeight: "40px",
          textDecoration:
            component.data.isLink && component.data.linkUnderline !== false
              ? "underline"
              : "none",
        };

        const handleTextChange = (newContent: string) => {
          onUpdate(component.id, {
            ...component.data,
            richText: newContent,
            text: newContent.replace(/<[^>]*>/g, ""), // HTMLタグを除去してプレーンテキストも保存
          });
        };

        const textElement = (
          <InlineRichTextEditor
            initialContent={
              component.data.richText ||
              component.data.text ||
              "テキストを入力してください"
            }
            onChange={handleTextChange}
            style={textStyle}
            className="w-full"
          />
        );

        return component.data.isLink && component.data.linkUrl ? (
          <div style={{ position: "relative" }}>
            {textElement}
            <a
              href={component.data.linkUrl}
              target={component.data.linkTarget || "_blank"}
              rel={
                component.data.linkTarget === "_blank"
                  ? "noopener noreferrer"
                  : undefined
              }
              className="absolute inset-0 z-10"
              style={{ textDecoration: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                // リンクがある場合は新しいタブで開く
                window.open(
                  component.data.linkUrl,
                  component.data.linkTarget || "_blank"
                );
              }}
            />
          </div>
        ) : (
          textElement
        );

      case "image":
        console.log("Rendering image component:", component.id, component.data);
        return (
          <div
            style={{
              textAlign: component.data.textAlign || "center",
              padding: isMobile ? "8px" : "16px",
              overflow: "visible",
              maxWidth: "100%",
              position: "relative",
            }}
          >
            <ImageComponent
              src={component.data.src}
              alt={component.data.alt}
              width={isMobile ? "100%" : component.data.width || "100%"}
              height={component.data.height || "auto"}
              onUpdate={(data) => {
                console.log("Image component onUpdate called with:", data);
                onUpdate(component.id, data);
              }}
              onImageUpload={handleImageUpload}
              isLoading={isImageLoading}
            />
          </div>
        );

      case "button":
        return (
          <div
            style={{
              textAlign: component.data.textAlign || "center",
              padding: isMobile ? "12px" : "20px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: component.data.backgroundColor || "#007bff",
                color: component.data.color || "#ffffff",
                padding:
                  component.data.padding ||
                  (isMobile ? "12px 20px" : "14px 24px"),
                margin: component.data.margin || "0px",
                borderRadius: component.data.borderRadius || "4px",
                fontSize: isMobile ? "14px" : component.data.fontSize || "16px",
                fontFamily: component.data.fontFamily || "Arial, sans-serif",
                fontWeight: component.data.fontWeight || "500",
                textDecoration: "none",
                cursor: "pointer",
                border: component.data.showBorder
                  ? `${component.data.borderWidth || "1px"} solid ${
                      component.data.borderColor || "#d1d5db"
                    }`
                  : "none",
                boxShadow: component.data.boxShadow || "none",
                width: component.data.width || (isMobile ? "120px" : "140px"),
                minHeight: "44px",
                outline: "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(component.id);
              }}
            >
              {component.data.text || "ボタンテキスト"}
            </div>
          </div>
        );

      case "divider":
        return (
          <div style={{ padding: isMobile ? "8px 16px" : "12px 20px" }}>
            <hr
              style={{
                border: "none",
                height: component.data.height || "1px",
                backgroundColor: component.data.color || "#e5e7eb",
                margin: "0",
              }}
            />
          </div>
        );

      case "spacer":
        return (
          <div
            style={{
              height: isMobile ? "16px" : component.data.height || "20px",
              backgroundColor: "transparent",
            }}
          />
        );

      case "header":
        return (
          <div
            style={{
              backgroundColor: component.data.backgroundColor || "#f8f9fa",
              padding: isMobile ? "20px 16px" : "30px 20px",
              textAlign: component.data.textAlign || "center",
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? "20px" : component.data.fontSize || "28px",
                color: component.data.color || "#000000",
                margin: "0",
                fontFamily: component.data.fontFamily || "Arial, sans-serif",
                fontWeight: component.data.fontWeight || "600",
                lineHeight: "1.2",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(component.id);
              }}
              className="cursor-pointer"
            >
              {component.data.title || "メールヘッダー"}
            </h1>
            {component.data.subtitle && (
              <p
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  color: component.data.subtitleColor || "#6b7280",
                  margin: "8px 0 0 0",
                  lineHeight: "1.4",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(component.id);
                }}
                className="cursor-pointer"
              >
                {component.data.subtitle}
              </p>
            )}
          </div>
        );

      case "footer":
        return (
          <div
            style={{
              backgroundColor: component.data.backgroundColor || "#f3f4f6",
              padding: isMobile ? "16px" : "20px",
              textAlign: component.data.textAlign || "center",
              fontSize: isMobile ? "12px" : "14px",
              color: component.data.color || "#6b7280",
              lineHeight: "1.5",
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(component.id);
              }}
              className="cursor-pointer"
            >
              {component.data.content || "フッター情報・配信停止リンクなど"}
            </div>
          </div>
        );

      case "social":
        return (
          <div
            style={{
              textAlign: component.data.alignment || "center",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <div
              className={`inline-flex ${isMobile ? "space-x-2" : "space-x-3"}`}
            >
              {component.data.platforms?.map((social: string) => (
                <a
                  key={social}
                  href={component.data[`${social}Url`] || "#"}
                  className={`inline-block ${
                    isMobile ? "w-6 h-6" : "w-8 h-8"
                  } bg-gray-400 rounded hover:opacity-80 transition-opacity`}
                  style={{
                    backgroundColor:
                      component.data[`${social}Color`] ||
                      getSocialColor(social),
                  }}
                  title={social}
                >
                  <span className="sr-only">{social}</span>
                </a>
              )) || (
                <div className="text-gray-400 text-sm">
                  ソーシャルリンクを設定してください
                </div>
              )}
            </div>
          </div>
        );

      case "html":
        return (
          <div
            style={{ padding: isMobile ? "8px 16px" : "12px 20px" }}
            dangerouslySetInnerHTML={{
              __html: component.data.content || "<p>HTMLコンテンツ</p>",
            }}
          />
        );

      case "columns":
        const columnCount = Math.min(component.data.columnCount || 2, 4);
        const columnsKey = `columns-${component.id}-${columnCount}`;

        console.log("Rendering columns component:", {
          componentId: component.id,
          columnCount,
          columnData: component.data,
          allColumns: Object.keys(component.data).filter((key) =>
            key.startsWith("column")
          ),
        });

        return (
          <div
            key={columnsKey}
            style={{ padding: isMobile ? "8px" : "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: component.data.gap || "20px",
                width: "100%",
              }}
            >
              {Array.from({ length: columnCount }, (_, index) => {
                const columnKey = `column${index + 1}`;
                const columnData = component.data[columnKey];
                const columnComponents = Array.isArray(columnData?.components)
                  ? columnData.components
                  : [];
                const isEmpty = columnComponents.length === 0;
                const uniqueColumnId = `${component.id}-column-${index}`;

                console.log(`Rendering column ${columnKey}:`, {
                  columnData,
                  columnComponents,
                  isEmpty,
                  componentCount: columnComponents.length,
                });

                return (
                  <ColumnDropZone
                    key={uniqueColumnId}
                    columnId={uniqueColumnId}
                    isEmpty={isEmpty}
                    isSelected={isSelected}
                  >
                    {isEmpty ? (
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: isMobile ? "12px" : "14px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "2px dashed #d1d5db",
                            fontSize: "16px",
                          }}
                        >
                          +
                        </span>
                        Add Module
                      </div>
                    ) : (
                      <SortableContext
                        items={columnComponents.map(
                          (comp: any, idx: number) =>
                            comp.id ||
                            `col-${component.id}-${index}-comp-${idx}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        {columnComponents.map(
                          (columnComponent: any, componentIndex: number) => {
                            const uniqueKey = `${uniqueColumnId}-comp-${componentIndex}`;
                            const columnComponentWithId = {
                              ...columnComponent,
                              id:
                                columnComponent.id ||
                                `col-${component.id}-${index}-comp-${componentIndex}`,
                            };

                            return (
                              <div
                                key={uniqueKey}
                                style={{
                                  width: "100%",
                                  position: "relative",
                                  zIndex: 1,
                                  marginBottom: "8px",
                                }}
                              >
                                <ColumnComponentRenderer
                                  component={columnComponentWithId}
                                  isSelected={
                                    selectedColumnComponentId ===
                                    columnComponentWithId.id
                                  }
                                  onSelect={onSelect}
                                  onUpdate={(componentId, data) => {
                                    console.log(
                                      "Column component update called:",
                                      {
                                        componentId,
                                        data,
                                        componentIndex,
                                        columnKey: `column${
                                          parseInt(
                                            uniqueColumnId.split("-column-")[1]
                                          ) + 1
                                        }`,
                                      }
                                    );

                                    const columnIndex = parseInt(
                                      uniqueColumnId.split("-column-")[1]
                                    );
                                    const columnKey = `column${
                                      columnIndex + 1
                                    }`;
                                    const updatedColumnData = {
                                      ...component.data,
                                      [columnKey]: {
                                        ...component.data[columnKey],
                                        components: component.data[
                                          columnKey
                                        ].components.map(
                                          (comp: any, idx: number) =>
                                            idx === componentIndex
                                              ? { ...comp, data }
                                              : comp
                                        ),
                                      },
                                    };

                                    console.log(
                                      "Updating parent component with:",
                                      updatedColumnData
                                    );
                                    onUpdate(component.id, updatedColumnData);
                                  }}
                                  onDelete={() => {
                                    const columnIndex = parseInt(
                                      uniqueColumnId.split("-column-")[1]
                                    );
                                    const columnKey = `column${
                                      columnIndex + 1
                                    }`;
                                    const updatedColumnData = {
                                      ...component.data,
                                      [columnKey]: {
                                        ...component.data[columnKey],
                                        components: component.data[
                                          columnKey
                                        ].components.filter(
                                          (_: any, idx: number) =>
                                            idx !== componentIndex
                                        ),
                                      },
                                    };
                                    onUpdate(component.id, updatedColumnData);
                                  }}
                                  isMobile={isMobile}
                                />
                              </div>
                            );
                          }
                        )}
                      </SortableContext>
                    )}
                  </ColumnDropZone>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 text-center text-gray-400">
            未対応のコンポーネント: {component.type}
          </div>
        );
    }
  };

  const getSocialColor = (platform: string): string => {
    const colors: Record<string, string> = {
      facebook: "#1877f2",
      twitter: "#1da1f2",
      instagram: "#e4405f",
      linkedin: "#0a66c2",
    };
    return colors[platform] || "#6b7280";
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        // 選択中やドラッグ中のz-indexを高めにし、通常時は自動で重なり順を保つ
        zIndex: isDragging ? 9999 : isSelected ? 100 : 1,
        // ツールバーの高さぶんだけ、表示時に上部余白を確保して重なりを軽減
        // ツールバー分のパディングはやめ、重なりはz-indexでのみ管理し無駄な空白を排除
        paddingTop: 0,
      }}
      className={`relative group transition-all duration-200 w-full max-w-full ${
        isSelected ? "ring-1 ring-blue-400 ring-offset-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      {renderComponent()}

      {/* ツールバー */}
      <div
        className={`absolute ${
          component.type === "image" ? "-top-10 h-10" : "-top-8 h-8"
        } left-0 right-0 bg-blue-500 text-white flex items-center justify-between px-2 transition-all duration-200 rounded-t-md z-50 ${
          isSelected || isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center space-x-1">
          <div
            {...attributes}
            {...listeners}
            className={`${
              component.type === "image" ? "p-2" : "p-1"
            } hover:bg-blue-600 rounded cursor-grab active:cursor-grabbing flex items-center border border-white/30 hover:border-white`}
            title={`${
              component.type === "image" ? "画像を" : ""
            }ドラッグして移動`}
            style={
              component.type === "image"
                ? { minWidth: "36px", minHeight: "28px" }
                : {}
            }
          >
            <GripVertical size={component.type === "image" ? 16 : 14} />
          </div>
          <span className="text-xs font-medium uppercase">
            {component.type === "image" ? "📷 " : ""}
            {component.type === "columns" ? "2列レイアウト" : component.type}
          </span>
          {component.type === "image" && component.data?.src && (
            <span className="text-xs bg-blue-600 px-1 py-0.5 rounded">
              設定済み
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            className={`${
              component.type === "image" ? "p-2" : "p-1"
            } hover:bg-red-500 rounded transition-colors flex items-center border border-transparent hover:border-white`}
            title="削除"
            style={
              component.type === "image"
                ? { minWidth: "32px", minHeight: "28px" }
                : {}
            }
          >
            <Trash2 size={component.type === "image" ? 14 : 12} />
          </button>
        </div>
      </div>
    </div>
  );
}
