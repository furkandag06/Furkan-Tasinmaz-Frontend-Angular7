import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddFormComponent } from './add-form/add-form.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { MapsComponent } from './maps/maps.component';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './admin-guard.service';
import { UserComponent } from './user/user.component';
import { LogComponent } from './log/log.component';


const routes: Routes = [
  { path: 'map', component: MapsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'add', component: AddFormComponent },
  { path: 'log', component: LogComponent },
  { path: 'edit/:id', component: EditModalComponent },
  { path: 'map', component: MapsComponent },
  { path: 'users', component: UserComponent, canActivate: [AdminGuard] },
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: '**', redirectTo: '/map' }  // catch-all route, redirect to login for any unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
