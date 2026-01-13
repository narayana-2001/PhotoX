import React, { useRef } from "react";
import "../index.css";

const UploadButton = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files); // Pass all files back to parent
    }
  };

  return (
    <div className="upload-button">
      <button onClick={handleButtonClick}>Upload</button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
        multiple
      />
    </div>
  );
};

export default UploadButton;
