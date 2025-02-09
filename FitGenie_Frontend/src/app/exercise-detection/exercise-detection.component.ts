import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-exercise-detection',
  templateUrl: './exercise-detection.component.html',
  styleUrls: ['./exercise-detection.component.css']
})
export class ExerciseDetectionComponent implements AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  detector!: posedetection.PoseDetector;
  isRecording = false;
  startTime!: number;
  duration = 0;
  detectedExercise = '';
  videoButtonTitle = 'Start Recording';

  email = localStorage.getItem('email');
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  constructor(private http: HttpClient, private dialogRef: MatDialogRef<ExerciseDetectionComponent>) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.video = this.videoElement.nativeElement;
      this.canvas = this.canvasElement.nativeElement;
      this.ctx = this.canvas.getContext('2d')!;
    }, 500); // Delay to ensure elements are initialized
  }

  async startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (this.video) {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => this.video.play();
      } else {
        console.error("Video element is not initialized.");
      }

      this.isRecording = true;
      this.videoButtonTitle = 'Recording...';
      this.startTime = Date.now();

      await this.loadPoseDetectionModel();
      this.detectPose();
    } catch (err: any) {
      console.error("Error accessing webcam:", err);
      alert("Error accessing the camera. Please check permissions.");
    }
  }

  async loadPoseDetectionModel() {
    try {
      await tf.setBackend('webgl');
      await tf.ready();

      const detectorConfig = { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER };
      this.detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);

      console.log("MoveNet Thunder model loaded successfully!");
    } catch (error) {
      console.error("Error loading pose detection model:", error);
    }
  }

  async detectPose() {
    if (!this.detector) {
      console.error("Pose detector is not loaded.");
      return;
    }

    const detect = async () => {
      if (!this.isRecording) return;

      const poses = await this.detector.estimatePoses(this.video);
      if (poses.length > 0) {
        this.drawPose(poses[0]);
        this.detectedExercise = this.identifyExercise(poses[0]);
      }

      requestAnimationFrame(detect);
    };

    detect();
  }

  drawPose(pose: posedetection.Pose) {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    pose.keypoints.forEach((point: posedetection.Keypoint) => {
      if (point.score && point.score > 0.5) {
        this.ctx!.beginPath();
        this.ctx!.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        this.ctx!.fillStyle = 'red';
        this.ctx!.fill();
      }
    });
  }

  identifyExercise(pose: posedetection.Pose): string {
    if (!pose.keypoints || pose.keypoints.length === 0) return 'Unknown Exercise';

    const keypoints: { [key: string]: posedetection.Keypoint | undefined } = {};
    pose.keypoints.forEach(kp => {
      if (kp.name) keypoints[kp.name] = kp;
    });

    const lw = keypoints['left_wrist'];
    const rw = keypoints['right_wrist'];
    const lk = keypoints['left_knee'];
    const rk = keypoints['right_knee'];
    const lh = keypoints['left_hip'];
    const rh = keypoints['right_hip'];

    if (!lw || !rw || !lk || !rk || !lh || !rh) return 'Unknown Exercise';

    if (lw.y > lh.y && rw.y > rh.y) return 'Push-Up';
    if (lk.y > lh.y && rk.y > rh.y) return 'Squat';
    if (lw.y < lh.y && rw.y < rh.y && Math.abs(lw.x - rw.x) > 50) return 'Jumping Jack';

    return 'Unknown Exercise';
  }

  stopRecording() {
    this.isRecording = false;
    this.videoButtonTitle = 'Start Recording';
    this.duration = (Date.now() - this.startTime) / 1000;

    if (this.video.srcObject) {
      (this.video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }

    this.saveExerciseData();
  }

  saveExerciseData() {
    const exerciseData = {
      exercise: this.detectedExercise,
      duration: this.duration
    };
    if (this.email) {
      this.authService.addExerciseData(this.email, exerciseData).subscribe(
        (res) => {
          this.notification.showNotification('Exercise data saved successfully', 'success')
        },
        (err) => {
          console.error("Error saving exercise data:", err);
        }
      );
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
}
