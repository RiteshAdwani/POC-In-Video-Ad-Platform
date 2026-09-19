import { useEffect, useMemo, useState } from 'react';

/**
 * @description Derives a preview URL for a selected file - an image previews directly via an
 * object URL, a video previews via a captured cover frame. Returns null for any other file type, or while a
 * video's frame is still decoding.
 */
export const useFilePreview = (file: File | undefined) => {
  const isImage = file?.type.startsWith('image/') ?? false;
  const isVideo = file?.type.startsWith('video/') ?? false;

  const imagePreviewUrl = useMemo(
    () => (isImage && file ? URL.createObjectURL(file) : null),
    [isImage, file],
  );

  /**
   * @description Revokes the image preview URL above once it's replaced or the file is cleared,
   * so selecting several images in a row doesn't leak one blob URL per selection.
   */
  useEffect(() => {
    if (!imagePreviewUrl) return;
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);

  /**
   * @description Captures a single frame of the selected video as a cover thumbnail, the way
   * upload UIs actually preview a video - not by playing the whole thing back inline. Runs the
   * decode on an offscreen <video>/<canvas> pair that never gets attached to the DOM.
   */
  useEffect(() => {
    if (!file || !isVideo) return;

    const objectUrl = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.src = objectUrl;
    videoEl.muted = true;

    // Seeks to the halfway point (capped at 1s) once duration is known, then captures that frame.
    const seekToFrame = () => {
      videoEl.currentTime = Math.min(1, videoEl.duration / 2);
    };
    const captureFrame = () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext('2d')?.drawImage(videoEl, 0, 0);
      setVideoThumbnailUrl(canvas.toDataURL('image/jpeg'));
    };

    videoEl.addEventListener('loadedmetadata', seekToFrame);
    videoEl.addEventListener('seeked', captureFrame);

    return () => {
      videoEl.removeEventListener('loadedmetadata', seekToFrame);
      videoEl.removeEventListener('seeked', captureFrame);
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isVideo]);

  return imagePreviewUrl ?? videoThumbnailUrl;
};
