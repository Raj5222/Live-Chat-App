import React, { useState, useEffect } from "react";

const FileUpload = ({ payload, fileInputRef, filesended }) => {
  const [fileSelected, setFileSelected] = useState(false);

  useEffect(() => {
    if (filesended) {
      setFileSelected(false); // Reset fileSelected when the file has been sent
    }
  }, [filesended]); // Trigger effect when the 'filesended' flag changes

  const handleFileChange = () => {
    setFileSelected(fileInputRef.current.files.length > 0);
  };

  if (payload) {
    const { file, fileName, fileSize } = payload;
    const fileType = file.match(/data:(.*?);/)[1]; // Extract MIME type

    const renderFileContent = () => {
      if (fileType.startsWith("image/")) {
        return (
          <>
            <img src={file} alt={fileName} className="image-attachment" />
            <br />
            <a href={file} download={fileName}>
              <button className="download">
                Download Image ({fileName}), Size: {fileSize} MB
              </button>
            </a>
          </>
        );
      }

      if (fileType.startsWith("video/")) {
        return (
          <>
            <video controls className="video-attachment">
              <source src={file} type={fileType} />
              Your browser does not support the video element.
            </video>
            <br />
            <a href={file} download={fileName}>
              <button className="download">
                Download Video ({fileName}), Size: {fileSize} MB
              </button>
            </a>
          </>
        );
      }

      if (fileType.startsWith("audio/")) {
        return (
          <>
            <audio controls className="audio-attachment">
              <source src={file} type={fileType} />
              Your browser does not support the audio element.
            </audio>
            <br />
            <a href={file} download={fileName}>
              <button className="download">
                Download Audio ({fileName}), Size: {fileSize} MB
              </button>
            </a>
          </>
        );
      }

      // For unsupported file types
      return (
        <>
          <a href={file} download={fileName}>
            <button className="download">
              Download {fileName}
              <br />
              Size: {fileSize} MB
            </button>
          </a>
        </>
      );
    };

    return renderFileContent();
  }

  return (
    <label className="file-input-label">
      <input
        type="file"
        ref={fileInputRef}
        className="file-input"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange} // onChange instead of onInput
      />
      <span className="icon">{fileSelected ? "✅" : "📎"}</span>
    </label>
  );
};

export default FileUpload;
