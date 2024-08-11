import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddFormComponent } from './add-form/add-form.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { MapComponent } from './map/map.component';
import { MapsComponent } from './maps/maps.component';
import { CoordinateService } from './coordinate-service.service';
import { LoginComponent } from './login/login.component';
import { UserService } from './user.service';
import { UserComponent } from './user/user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserDeleteComponent } from './user-delete/user-delete.component';
import { LogComponent } from './log/log.component';
import { LogService } from './log.service';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AddFormComponent,
    EditModalComponent,
    DeleteModalComponent,
    MapComponent,
    MapsComponent,
    LoginComponent,
    UserComponent,
    EditUserComponent,
    UserDeleteComponent,
    LogComponent,
    AddUserModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,  // Add ReactiveFormsModule here
    FormsModule,
    NgbModule
  ],
  providers: [CoordinateService,UserService,LogService],
  bootstrap: [AppComponent],
  entryComponents: [EditModalComponent, DeleteModalComponent,EditUserComponent,UserDeleteComponent,AddUserModalComponent]
})
export class AppModule { }
