import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/fitgenie/routes';
  private pythonUrl = 'http://localhost:8000';
  constructor(private http: HttpClient) {}
  // Send contact form
  sendMessageForm(name: String, email: String, message: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact-form`, { name, email, message });
  }
  //Book Emergency Appointment
  bookEmergencyAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book-emergency-appointment`, data);
  }
  // Signup form
  signup(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }
  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }
  // Login form
  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }
  verifyLoginOtp(data: any) {
    return this.http.post<any>(`${this.apiUrl}/verify-login-otp`, data);
  }
  //Sign Up with Google
  googleSignup(userData: any){
    return this.http.post<any>(`${this.apiUrl}/google-signup`, userData);
  }
  logout(email: string) {
    return this.http.post<any>(`${this.apiUrl}/logout`, { email });
  }
  // Forgot password - Step 1: Send OTP
  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
  // Forgot password - Step 2: Verify OTP
  verifyForgotPasswordOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-forgotp-otp`, { email, otp });
  }
  // Forgot password - Step 3: Reset Password
  resetPassword(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, password });
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Check if token exists in localStorage
  }
  getUserName(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getUserName`, { email });
  }
  // Verify Secret Key
  verifySecretKey(secretKey: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifySecretKey`, { secretKey });
  }
  //Check User Type
  userType(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user-type`, { email });
  }
  //Generate Chatbot response
  generateResponse(prompt: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot`, { prompt });
  }
  //Add Gym Details
  addGymDetails(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addGymCenter`, data);
  }
  //Check if gym is registered or not
  gymRegistered(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/isRegistered`, { email });
  }
  //Fetch Unverified Gym Centres
  fetchUnverifiedCentres(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unverifiedCentres`);
  }
  //Verify Gym Centre
  verifyGymCenter(centerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifyCenter`, { centerId });
  }
  //Fetch Health Data
  getHealthData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFitData`);
  }
  //Fetch Doctor details by filtering specialization, city, language & gender
  fetchFilteredCenterDetails(filters: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetch-filtered-gym-details`, filters); // Send filters directly
  }
  //Load gym detaiis
  loadGymDetails(centerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetch-gym-details`, { centerId });
  }
  //To edit gym details
  updateGymDetails(gymId: string, updatedDetails: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/gym/${gymId}`, { ...updatedDetails });
  }
  //Add to wishlist
  addToWishlist(email: string, gymId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-to-wishlist`, { email, gymId });
  }
  //Check already in wishlist
  checkInWishlist(email: string, gymId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/is-gym-in-wishlist`, { email, gymId });
  }
  //Create New Post
  createPost(userId: string, content: string, userType: String, email: String): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-post`, { userId, content, userType, email });
  }
  //Fetch All posts
  fetchPosts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fetch-posts`);
  }
  //Like posts
  likePost(postId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/like-post`, { postId, userId });
  }
  //Comment Any Post
  commentPost( postId: String, comment: String, userId: String, userType: String, email: String, parentCommentId: String ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comment-post`, { postId, comment, userId, userType, email, parentCommentId });
  }
  //Like Comment
  likeComment(commentId: string, userId: string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/like-comment`, { commentId, userId })
  }
  // Delete Post
  deletePost(postId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-post/${postId}`);
  }
  // Delete Comment
  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-comment/${commentId}`);
  }
  calculateBmi(weight: number, height: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bmicalculator`, { weight, height });
  }
  //Fetch Wishlist Items from Database
  fetchWishlistItems(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetch-wishlist-items`, { email });
  }
  //Add exercise details
  addExercise(exerciseData: any): Observable<any> {
    console.log(exerciseData)
    return this.http.post<any>(`${this.apiUrl}/add-exercise`, { exerciseData })
  }
  //Fetch Exercises
  fetchExercises(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/exercises`);
  }
  //Get recommendations for exercise
  getExerciseRecommendations(UserInput: any): Observable<any> {
    return this.http.post<any>(`${this.pythonUrl}/recommend`, UserInput);
  }
  //Find Exercise By ID
  findExerciseById(exerciseId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetchExerciseByID`, { exerciseId });
  }
  //Add Exercise Data to User Account
  addExerciseData(email: string, exerciseData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/saveExerciseData`, { email, exerciseData });
  }
  //Add activity to logs
  addActivity(email: string, activity: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logEcoFriendlyActivity`, { email, activity });
  }
  //Fetch User's Activity Logs
  fetchActivityLogs(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fetchUserActivityLogs`, { email });
  }
}
