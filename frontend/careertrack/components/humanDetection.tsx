"use client";

import React, { useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

export const HumanDetection = ({ 
  videoRef, 
  canvasRef 
}: { 
  videoRef: React.RefObject<HTMLVideoElement>, 
  canvasRef: React.RefObject<HTMLCanvasElement> 
}) => {
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Only proceed if video reference exists
    if (!videoRef.current) return;
    
    // Set up video event listeners
    const video = videoRef.current;
    
    // Wait for video to be loaded and have dimensions
    const handleVideoReady = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        setIsVideoReady(true);
      }
    };
    
    // Listen for metadata loaded which contains video dimensions
    video.addEventListener('loadedmetadata', handleVideoReady);
    
    // Check if video is already ready
    if (video.readyState >= 2) {
      setIsVideoReady(true);
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', handleVideoReady);
    };
  }, [videoRef]);

  useEffect(() => {
    // Only run detection when video is ready
    if (!isVideoReady || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure canvas dimensions match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    let detectionInterval: NodeJS.Timeout;
    
    const detectHumans = async () => {
      try {
        const model = await cocoSsd.load();
        
        detectionInterval = setInterval(async () => {
          if (!video || !canvas) return;
          
          // Ensure video has valid dimensions and is playing
          if (video.videoWidth === 0 || video.videoHeight === 0) return;
          
          const predictions = await model.detect(video);
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Find largest person
            const persons = predictions.filter(p => p.class === "person");
            if (persons.length > 0) {
              const largest = persons.reduce((prev, current) =>
                (prev.bbox[2] * prev.bbox[3] > current.bbox[2] * current.bbox[3]) ? prev : current
              );
              
              // Draw only largest person
              ctx.strokeStyle = "red";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                largest.bbox[0],
                largest.bbox[1],
                largest.bbox[2],
                largest.bbox[3]
              );
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error in human detection:", error);
      }
    };
    
    tf.ready().then(detectHumans);
    
    // Clean up
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isVideoReady, videoRef, canvasRef]);
  
  return null;
}