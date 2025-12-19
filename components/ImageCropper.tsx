"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ImageCropperProps {
    open: boolean;
    image: string;
    aspectRatio?: number | null;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export function ImageCropper({ open, image, aspectRatio = null, onCropComplete, onCancel }: ImageCropperProps) {
    const { t } = useTranslation();
    const imgRef = useRef<HTMLImageElement>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        if (aspectRatio) {
            setCrop(centerAspectCrop(width, height, aspectRatio));
        } else {
            setCrop(centerAspectCrop(width, height, width / height));
        }
    }

    const handleCrop = async () => {
        const imageEl = imgRef.current;
        if (!imageEl || !completedCrop) return;

        try {
            setIsCropping(true);

            const scaleX = imageEl.naturalWidth / imageEl.width;
            const scaleY = imageEl.naturalHeight / imageEl.height;

            const canvas = document.createElement('canvas');
            canvas.width = completedCrop.width * scaleX;
            canvas.height = completedCrop.height * scaleY;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('No 2d context');
            }

            ctx.drawImage(
                imageEl,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const mimeType = image.startsWith('data:')
                ? image.substring(5, image.indexOf(';'))
                : 'image/png';

            const quality = mimeType === 'image/jpeg' ? 0.95 : undefined;

            canvas.toBlob((blob) => {
                if (blob) {
                    onCropComplete(blob);
                }
                setIsCropping(false);
            }, mimeType, quality);
        } catch (e) {
            console.error("Error cropping image:", e);
            setIsCropping(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-3xl p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{t('common.cropImage')}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full overflow-auto bg-gray-100 max-h-[600px] flex items-center justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio || undefined}
                    >
                        <img
                            ref={imgRef}
                            alt={t('common.crop')}
                            src={image}
                            onLoad={onImageLoad}
                            style={{ maxWidth: '100%', display: 'block' }}
                        />
                    </ReactCrop>
                </div>
                <DialogFooter className="px-6 pb-6">
                    <Button variant="outline" onClick={onCancel} disabled={isCropping}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleCrop} disabled={isCropping}>
                        {isCropping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.crop')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
