import * as tf from '@tensorflow/tfjs';
import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;
let backendReady = false;

export interface FaceDetectionResult {
  detected: boolean;
  faces: faceapi.FaceDetection[];
  landmarks?: faceapi.FaceLandmarks68[];
}

const MODEL_URL = '/models';

async function initializeBackend(): Promise<void> {
  if (backendReady) return;
  
  try {
    await tf.setBackend('cpu');
    await tf.ready();
    backendReady = true;
    console.log('TensorFlow.js backend initialized:', tf.getBackend());
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js backend:', error);
    throw error;
  }
}

export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) return;
  
  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }
  
  modelLoadingPromise = (async () => {
    try {
      await initializeBackend();
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Error loading face detection models:', error);
      modelLoadingPromise = null;
      throw error;
    }
  })();
  
  return modelLoadingPromise;
}

export function isModelLoaded(): boolean {
  return modelsLoaded;
}

export async function detectFaces(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  if (!modelsLoaded) {
    await loadFaceDetectionModels();
  }
  
  try {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true);
    
    return {
      detected: detections.length > 0,
      faces: detections.map(d => d.detection),
      landmarks: detections.map(d => d.landmarks),
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return { detected: false, faces: [] };
  }
}

export async function detectSingleFace(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  if (!modelsLoaded) {
    await loadFaceDetectionModels();
  }
  
  try {
    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true);
    
    if (detection) {
      return {
        detected: true,
        faces: [detection.detection],
        landmarks: [detection.landmarks],
      };
    }
    
    return { detected: false, faces: [] };
  } catch (error) {
    console.error('Face detection error:', error);
    return { detected: false, faces: [] };
  }
}
