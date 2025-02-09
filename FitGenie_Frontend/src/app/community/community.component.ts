import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, FooterComponent, RouterLink],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent {
  posts: any[] = [];
  newPostContent: string = '';
  userType: string = '';
  userId = localStorage.getItem('userId');
  email = localStorage.getItem('email');
  userName = localStorage.getItem('userName');
  commentText: string = '';
  replyingTo: string | null = null; // Stores the parent comment ID for replies
  commentInputVisible: { [postId: string]: boolean } = {};
  commentsVisible: { [postId: string]: boolean } = {};

  currentDate = new Date();
  days: number[] = [];
  month!: string;
  year!: number;
  firstDay!: number;
  today!: number;

  private authService = inject(AuthService);

  ngOnInit() {
    if(localStorage.getItem('isAdmin'))this.userType = 'Admin';
    else if(localStorage.getItem('isFitnessCenter')) this.userType = 'Fitness Center';
    else this.userType = 'User';
    this.fetchPosts();
    this.generateCalendar();
  }
  toggleCommentInput(postId: string) {
    this.commentInputVisible[postId] = !this.commentInputVisible[postId];
  }

  toggleComments(postId: string) {
    this.commentsVisible[postId] = !this.commentsVisible[postId];
  }

  fetchPosts() {
    this.authService.fetchPosts().subscribe((data: any) => {
      this.posts = data;
    });
  }

  addPost() {
    if (!this.userId) {
      alert('You must be logged in to post.');
      return;
    }

    if(this.email){
      this.authService.createPost(this.userId, this.newPostContent, this.userType, this.email).subscribe(() => {
        this.fetchPosts();
        this.newPostContent = '';
      });
    }
  }

  likePost(postId: string) {
    if(this.userId){
      this.authService.likePost(postId, this.userId).subscribe(() => {
        this.fetchPosts();
      });
    }
  }
  postComment(postId: string, parentCommentId: string | null = null) {
    if (!this.commentText.trim()) return;
    console.log(postId, this.commentText, this.userId, this.userType, this.email, parentCommentId)
    if(this.userId && this.userType && this.email){
      this.authService.commentPost(postId, this.commentText, this.userId, this.userType, this.email, parentCommentId ?? '').subscribe(() => {
        this.commentText = '';
        this.replyingTo = null; // Reset reply state
        this.fetchPosts();
      });
    }
  }

  likeComment(commentId: string) {
    if(this.userId){
      this.authService.likeComment(commentId, this.userId).subscribe(() => {
        this.fetchPosts();
      });
    }
  }

  startReplying(commentId: string) {
    this.replyingTo = commentId;
  }
  deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.authService.deletePost(postId).subscribe(() => {
        this.fetchPosts();
      });
    }
  }

  deleteComment(commentId: string) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.authService.deleteComment(commentId).subscribe(() => {
        this.fetchPosts();
      });
    }
  }


  generateCalendar() {
    const date = new Date();
    this.month = date.toLocaleString('default', { month: 'long' });
    this.year = date.getFullYear();
    this.today = date.getDate();

    const firstDayDate = new Date(this.year, date.getMonth(), 1);
    this.firstDay = firstDayDate.getDay(); // 0 (Sunday) - 6 (Saturday)

    const totalDays = new Date(this.year, date.getMonth() + 1, 0).getDate();
    this.days = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  timeAgo(timestamp: string): string {
    const currentTime = new Date();
    const givenTime = new Date(timestamp);
    const diffInSeconds = Math.floor((currentTime.getTime() - givenTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just Now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

}
