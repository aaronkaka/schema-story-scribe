
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  title: string;
  accept: string;
  onFileChange: (content: string) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  title,
  accept,
  onFileChange,
  className,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileChange(event.target.result as string);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileChange(event.target.result as string);
      }
    };
    
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileName(null);
    onFileChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={cn("border-2 shadow-sm", className, {
      "border-primary border-dashed": isDragging,
    })}>
      <CardContent className="p-4">
        <div
          className="flex flex-col items-center justify-center gap-4 py-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileName ? (
            <div className="flex w-full items-center justify-between bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">{fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop or click to upload
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
