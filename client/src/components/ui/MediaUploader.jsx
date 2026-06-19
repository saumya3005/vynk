import { useState, useRef } from 'react';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon, Film } from 'lucide-react';

const MediaUploader = ({ onFileSelect, accept = "image/*,video/*", label = "Upload Media" }) => {
  const [preview, setPreview] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type
    });

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileDetails(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div 
      onClick={() => !fileDetails && inputRef.current?.click()}
      className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all ${
        fileDetails ? 'border-primary/50 bg-surface' : 'border-border hover:border-primary hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center text-center'
      }`}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
      />
      
      {!fileDetails ? (
        <>
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-muted mb-4 shadow-sm">
            <UploadCloud size={32} />
          </div>
          <h4 className="font-bold text-text mb-1">{label}</h4>
          <p className="text-sm text-muted">Click to browse files</p>
        </>
      ) : (
        <div className="relative group">
          <button 
            onClick={removeFile}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center z-10 hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
          >
            <X size={16} />
          </button>
          
          {preview ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-md">
              {fileDetails.type.startsWith('video/') ? (
                <video src={preview} controls className="w-full h-full object-contain" />
              ) : (
                <img src={preview} alt="preview" className="w-full h-full object-contain" />
              )}
            </div>
          ) : (
            <div className="w-full py-8 flex flex-col items-center justify-center gap-3 bg-white/5 rounded-xl border border-border">
              <FileIcon size={48} className="text-primary opacity-80" />
              <div className="text-center">
                <p className="font-bold text-text truncate max-w-xs">{fileDetails.name}</p>
                <p className="text-sm text-muted">{fileDetails.size}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
