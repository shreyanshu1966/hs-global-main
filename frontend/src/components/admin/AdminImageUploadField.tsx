import { useId, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import ImageCropper from '../ImageCropper';
import { homePageConfigService } from '../../services/homePageConfigService';

interface AdminImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  aspectRatio?: number;
  className?: string;
}

const AdminImageUploadField = ({
  value,
  onChange,
  placeholder = 'Image URL/path',
  aspectRatio,
  className = '',
}: AdminImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [cropSource, setCropSource] = useState<{ src: string; file: File } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropSource({ src: String(e.target?.result || ''), file });
    };
    reader.readAsDataURL(file);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!cropSource) {
      return;
    }

    try {
      setUploading(true);
      const croppedFile = new File([blob], cropSource.file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', {
        type: 'image/jpeg',
      });
      const uploadedUrl = await homePageConfigService.uploadHomePageImage(croppedFile);
      onChange(uploadedUrl);
    } catch (error: any) {
      alert(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setCropSource(null);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleSelectFile}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          Upload
        </label>
      </div>
      {value && (
        <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={value} alt="Selected" className="h-full w-full object-cover" />
        </div>
      )}

      {cropSource && (
        <ImageCropper
          src={cropSource.src}
          onCropComplete={(blob) => handleCropComplete(blob)}
          onCancel={() => setCropSource(null)}
          aspectRatio={aspectRatio}
          fileName={cropSource.file.name}
        />
      )}
    </div>
  );
};

export default AdminImageUploadField;
