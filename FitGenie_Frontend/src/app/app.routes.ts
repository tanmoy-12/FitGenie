import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { Routes, CanActivate } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './guards/auth.guard'
import { OpenGuard } from './guards/open.guard';
import { AdminGuard } from './guards/admin.guard';
import { centerGuard } from './guards/center.guard';
import { userGuard } from './guards/user.guard';
import { CenterComponent } from './center/center.component';
import { CentersComponent } from './centers/centers.component';
import { CenterDetailsComponent } from './center-details/center-details.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { CommunityComponent } from './community/community.component';
import { ExerciseDetailsComponent } from './exercise-details/exercise-details.component';
import { ExerciseDetectionComponent } from './exercise-detection/exercise-detection.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Add more routes as needed
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [AuthGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [AuthGuard]},
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard]},
  { path: 'user', component: UserComponent, canActivate: [userGuard] },  // Change to UserComponent when user authentication is implemented
  { path: 'center', component: CenterComponent, canActivate: [centerGuard]},
  { path: 'centers', component: CentersComponent },
  { path: 'centerDetails/:id', component: CenterDetailsComponent },
  { path: 'wishList', component: WishlistComponent, canActivate: [OpenGuard] },
  { path: 'exercises', component: ExercisesComponent, canActivate: [OpenGuard] },
  { path: 'community', component: CommunityComponent },
  { path: 'exerciseDetails/:id', component: ExerciseDetailsComponent },
  { path: 'exerciseDetection', component: ExerciseDetectionComponent },
];
