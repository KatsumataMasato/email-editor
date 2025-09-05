'use client';

import React, { useRef } from 'react';

export function TestRichEditor() {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    console.log('TestRichEditor: execCommand called', command, value);
    
    const editor = editorRef.current;
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    editor.focus();
    
    // Select all if no selection
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      console.log('No selection, selecting all');
      const range = document.createRange();
      range.selectNodeContents(editor);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    try {
      const result = document.execCommand(command, false, value);
      console.log('execCommand result:', result);
      console.log('Editor HTML after command:', editor.innerHTML);
    } catch (error) {
      console.error('execCommand error:', error);
    }
  };

  const showHTML = () => {
    if (editorRef.current) {
      console.log('Current HTML:', editorRef.current.innerHTML);
      alert(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h2>Test Rich Editor</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => execCommand('bold')} style={{ margin: '5px' }}>
          Bold
        </button>
        <button onClick={() => execCommand('italic')} style={{ margin: '5px' }}>
          Italic
        </button>
        <button onClick={() => execCommand('underline')} style={{ margin: '5px' }}>
          Underline
        </button>
        <button onClick={() => execCommand('fontSize', '5')} style={{ margin: '5px' }}>
          Large
        </button>
        <input 
          type="color" 
          onChange={(e) => execCommand('foreColor', e.target.value)}
          style={{ margin: '5px' }}
        />
        <button onClick={showHTML} style={{ margin: '5px' }}>
          Show HTML
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        style={{
          border: '1px solid black',
          minHeight: '100px',
          padding: '10px',
          backgroundColor: 'white'
        }}
      >
        Type some text here and test formatting...
      </div>
    </div>
  );
}