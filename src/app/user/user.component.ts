import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';
import { User } from '../home/models/User';
import { AddUserModalComponent } from '../add-user-modal/add-user-modal.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserDeleteComponent } from '../user-delete/user-delete.component';
import { AuthService } from '../auth-service.service';
import * as alertify from 'alertifyjs';
import { Router } from '@angular/router';
import { LogService } from '../log.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userForm: FormGroup;
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 7;
  totalPages: number = 0;
  idsToExclude: Set<number> = new Set<number>(); // IDs to exclude

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private logService: LogService
  ) {
    this.userForm = this.fb.group({
      users: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.checkAdmin();
  }

  checkAdmin(): void {
    if (!this.authService.isAdmin()) {
      alert('Bu sayfayı görüntüleme izniniz yok. Lütfen yetkili kullanıcı olarak giriş yapınız.');
      this.router.navigate(['/home']);
    } else {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(
      (data: User[]) => {
        this.users = data.sort((a, b) => a.id - b.id);
        this.filteredUsers = this.users; // Başlangıçta tüm kullanıcıları filtreliyoruz
        this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        this.updatePaginatedUsers();
      },
      (error) => {
        console.error('Kullanıcılar yüklenirken bir hata oluştu', error);
        alertify.error('Kullanıcılar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    );
  }

  updatePaginatedUsers(): void {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
    this.setUserFormArray();
  }

  setUserFormArray(): void {
    const userFGs = this.paginatedUsers.map(user => this.fb.group({
      selected: new FormControl(false),
      ...user
    }));
    const userFormArray = this.fb.array(userFGs);
    this.userForm.setControl('users', userFormArray);
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.usersFormArray.controls.forEach(control => control.get('selected').setValue(isChecked));
  }

  get usersFormArray(): FormArray {
    return this.userForm.get('users') as FormArray;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }

  openAddUserModal(): void {
    const modalRef = this.modalService.open(AddUserModalComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.loadUsers();
        alertify.success('Kullanıcı başarıyla eklendi.');
      }
    }).catch((error) => {
      console.log('Modal kapatıldı:', error);
    });
  }

  openEditUserModal(user: User): void {
    const modalRef = this.modalService.open(EditUserComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.user = user;

    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadUsers();
        alertify.success('Kullanıcı başarıyla güncellendi.');
      }
    }).catch((error) => {
      console.log('Modal kapatıldı:', error);
    });
  }

  openDeleteUserModal(userId: number): void {
    const modalRef = this.modalService.open(UserDeleteComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.userId = userId;

    modalRef.result.then((result) => {
      if (result === 'deleted') {
        this.loadUsers();
        alertify.success('Kullanıcı başarıyla silindi.');
      }
    }).catch((error) => {
      console.log('Modal kapatıldı:', error);
    });
  }

  deleteSelectedUsers(): void {
    const selectedUsers = this.usersFormArray.controls
      .filter(control => control.get('selected').value)
      .map(control => control.value);

    if (selectedUsers.length === 0) {
      alertify.warning('Silinecek kullanıcı seçilmedi.');
      return;
    }

    // Function to remove sensitive fields
    const sanitizeUser = (user: User): any => {
      const { passwordHash, passwordSalt, ...sanitizedUser } = user;
      return sanitizedUser;
    };

    // Show confirmation dialog
    alertify.confirm(
      'Silme Onayı',
      'Silmek istediğinize emin misiniz?',
      () => {
        // Log the deletion attempt
        this.logService.addLog('Deletion Attempt', 'Delete', `Attempt to delete ${selectedUsers.length} users`).subscribe(
          () => console.log('Deletion attempt logged'),
          (error) => console.error('Error logging deletion attempt:', error)
        );

        // Proceed with deletion
        selectedUsers.forEach(user => {
          this.userService.delete(user.id).subscribe(
            () => {
              alertify.success(`Kullanıcı başarıyla silindi: ${user.name}`);
              this.loadUsers();

              // Log the deletion
              this.logService.addLog('Başarılı', 'Kullanıcı Silme', `User deleted: ${JSON.stringify(sanitizeUser(user))}`).subscribe(
                () => console.log('User deletion logged'),
                (error) => console.error('Error logging user deletion:', error)
              );
            },
            (error) => {
              console.error('Kullanıcı silinirken bir hata oluştu', error);
              alertify.error(`Kullanıcı silinirken bir hata oluştu: ${user.name}`);
              
              // Log the deletion error
              this.logService.addLog('Error Deleting User', 'Delete', `Error deleting user: ${JSON.stringify(sanitizeUser(user))}. Error: ${error.message}`).subscribe(
                () => console.log('User deletion error logged'),
                (error) => console.error('Error logging user deletion error:', error)
              );
            }
          );
        });
      },
      () => {
        // If canceled, log the cancellation
        alertify.message('Kullanıcı silme iptal edildi.');
        this.logService.addLog('User Deletion Cancelled', 'Cancel', 'User deletion was cancelled').subscribe(
          () => console.log('Deletion cancellation logged'),
          (error) => console.error('Error logging deletion cancellation:', error)
        );
      }
    );
  }

  searchUsers(searchTerm: string): void {
    // Filter users based on search term and excluded IDs
    this.filteredUsers = this.users.filter(user =>
      !this.idsToExclude.has(user.id) && (
        user.id.toString().includes(searchTerm) || // Check if search term is in ID
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    // Reset to the first page on search
    this.currentPage = 0;
    
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    
    // Update paginated users based on the current page
    this.updatePaginatedUsers();
  }

  // Method to add an ID to the exclusion list
  excludeUserId(id: number): void {
    this.idsToExclude.add(id);
    this.searchUsers(''); // Refresh the search with current exclusions
  }
}
