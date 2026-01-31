"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, File, Image, FileText, FileSpreadsheet, FileArchive, AlertCircle, Check } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";

export interface FileWithPreview extends File {
    preview?: string;
    progress?: number;
    error?: string;
    uploaded?: boolean;
}

export interface FileUploadProps {
    value?: FileWithPreview[];
    onChange?: (files: FileWithPreview[]) => void;
    onUpload?: (file: File) => Promise<void>;
    accept?: string;
    maxSize?: number; // in bytes
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    dropzoneText?: string;
    showPreview?: boolean;
}

const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) {
        return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
    }
    if (type.includes("zip") || type.includes("rar") || type.includes("tar")) {
        return <FileArchive className="h-8 w-8 text-amber-500" />;
    }
    return <File className="h-8 w-8 text-zinc-500" />;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
    ({
        value = [],
        onChange,
        onUpload,
        accept,
        maxSize = 10 * 1024 * 1024, // 10MB default
        maxFiles = 10,
        multiple = true,
        disabled = false,
        error,
        className,
        dropzoneText = "Arraste arquivos aqui ou clique para selecionar",
        showPreview = true,
    }, ref) => {
        const [isDragging, setIsDragging] = React.useState(false);
        const inputRef = React.useRef<HTMLInputElement>(null);

        const validateFile = (file: File): string | null => {
            if (maxSize && file.size > maxSize) {
                return `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`;
            }

            if (accept) {
                const acceptedTypes = accept.split(",").map(t => t.trim());
                const fileType = file.type;
                const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

                const isAccepted = acceptedTypes.some(accepted => {
                    if (accepted.startsWith(".")) {
                        return fileExt === accepted.toLowerCase();
                    }
                    if (accepted.endsWith("/*")) {
                        return fileType.startsWith(accepted.replace("/*", ""));
                    }
                    return fileType === accepted;
                });

                if (!isAccepted) {
                    return "Tipo de arquivo não permitido";
                }
            }

            return null;
        };

        const processFiles = async (fileList: FileList | File[]) => {
            const files = Array.from(fileList);
            const currentCount = value.length;
            const availableSlots = maxFiles - currentCount;

            if (availableSlots <= 0) {
                return;
            }

            const filesToAdd = files.slice(0, availableSlots);
            const newFiles: FileWithPreview[] = [];

            for (const file of filesToAdd) {
                const error = validateFile(file);
                const fileWithPreview: FileWithPreview = Object.assign(file, {
                    preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                    progress: 0,
                    error: error || undefined,
                    uploaded: false,
                });

                newFiles.push(fileWithPreview);

                // Start upload if no validation error and onUpload provided
                if (!error && onUpload) {
                    try {
                        await onUpload(file);
                        Object.assign(fileWithPreview, { progress: 100, uploaded: true });
                    } catch {
                        Object.assign(fileWithPreview, { error: "Erro ao enviar arquivo", progress: 0 });
                    }
                }
            }

            onChange?.([...value, ...newFiles]);
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            if (!disabled) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFiles(files);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                processFiles(files);
            }
            // Reset input
            e.target.value = "";
        };

        const handleRemove = (index: number) => {
            const file = value[index];
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
            onChange?.(value.filter((_, i) => i !== index));
        };

        const handleClick = () => {
            if (!disabled) {
                inputRef.current?.click();
            }
        };

        // Cleanup previews on unmount
        React.useEffect(() => {
            return () => {
                value.forEach(file => {
                    if (file.preview) {
                        URL.revokeObjectURL(file.preview);
                    }
                });
            };
        }, []);

        return (
            <div ref={ref} className={className}>
                {/* Dropzone */}
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed transition-all cursor-pointer",
                        "flex flex-col items-center justify-center p-8 gap-3",
                        isDragging && "border-primary bg-primary/5",
                        !isDragging && "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500",
                        disabled && "opacity-50 cursor-not-allowed",
                        error && "border-red-500"
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        disabled={disabled}
                        onChange={handleInputChange}
                        className="sr-only"
                    />

                    <div className={cn(
                        "h-12 w-12 flex items-center justify-center rounded-full",
                        isDragging ? "bg-primary/20" : "bg-zinc-100 dark:bg-zinc-800"
                    )}>
                        <Upload className={cn(
                            "h-6 w-6",
                            isDragging ? "text-primary" : "text-zinc-500"
                        )} />
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {dropzoneText}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {accept && `Tipos: ${accept}`}
                            {accept && maxSize && " | "}
                            {maxSize && `Máximo: ${formatFileSize(maxSize)}`}
                        </p>
                    </div>

                    {value.length > 0 && maxFiles > 1 && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {value.length} de {maxFiles} arquivos
                        </p>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                {/* File list */}
                {showPreview && value.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {value.map((file, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center gap-3 p-3 border",
                                    file.error
                                        ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"
                                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                )}
                            >
                                {/* Preview / Icon */}
                                <div className="shrink-0">
                                    {file.preview ? (
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="h-12 w-12 object-cover"
                                        />
                                    ) : (
                                        getFileIcon(file)
                                    )}
                                </div>

                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {formatFileSize(file.size)}
                                    </p>

                                    {/* Error message */}
                                    {file.error && (
                                        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {file.error}
                                        </p>
                                    )}

                                    {/* Progress bar */}
                                    {!file.error && file.progress !== undefined && file.progress > 0 && file.progress < 100 && (
                                        <Progress value={file.progress} className="mt-2 h-1" />
                                    )}
                                </div>

                                {/* Status / Remove button */}
                                <div className="shrink-0">
                                    {file.uploaded ? (
                                        <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(index);
                                            }}
                                            className="text-zinc-500 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
