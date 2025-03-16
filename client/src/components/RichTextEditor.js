// src/components/RichTextEditor.js
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, height = 500 }) => {
  const editorRef = useRef(null);
  
  return (
    <Editor
      apiKey="your-tinymce-api-key"
      onInit={(evt, editor) => editorRef.current = editor}
      initialValue={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  );
};
export default RichTextEditor;