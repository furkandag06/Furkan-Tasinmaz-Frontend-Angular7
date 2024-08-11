import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../apiservice.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent implements OnInit {
  @Input() item: any;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  cities: any[] = [];
  districts: any[] = [];
  neigborhoods: any[] = [];
  editForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal, 
    private apiService: ApiserviceService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Form oluşturma
    this.editForm = this.fb.group({
      city: [null, Validators.required],
      district: ['', Validators.required],
      neighborhood: ['', Validators.required],
      island: [''],
      parcel: [''],
      quality: ['']
    });

    // Şehirleri al
    this.apiService.getCities().subscribe(
      data => this.cities = data,
      error => console.error('Şehir verileri yükleme hatası', error)
    );
    this.apiService.getDistricts(this.item.neigborhood.district.city.id).subscribe(
      data=>this.districts=data,
      error=>console.error('hata')
    );
    this.apiService.getNeighborhoods(this.item.neigborhood.district.id).subscribe(
      data=>this.neigborhoods=data,
      error=>console.error('hata')
    );
    // Formu mevcut item ile doldurma
    if (this.item) {
      this.editForm.patchValue({
        city: this.item.neigborhood.district.city.id,
        district: this.item.neigborhood.district.id,
        neighborhood: this.item.neigborhood.id,
        island: this.item.island,
        parcel: this.item.parcel,
        quality: this.item.quality
      });

     
    }
  }

  onCityChange(cityId: number) {
    this.apiService.getDistricts(cityId).subscribe(
      data => {
        this.districts = data;
        console.log(data);
        this.editForm.get('district').setValue(null); // İlçe seçimlerini sıfırla
        this.editForm.get('neighborhood').setValue(null); // Mahalleleri sıfırla
      },
      error => console.error('İlçe verileri yükleme hatası', error)
    );
  }

  onDistrictChange(districtId: number) {
    this.apiService.getNeighborhoods(districtId).subscribe(
      data => this.neigborhoods = data,
      error => console.error('Mahalle verileri yükleme hatası', error)
    );
  }

  saveChanges() {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      this.item.neigborhoodId = Number(formValue.neighborhood);
      this.item.island = formValue.island;
      this.item.parcel = formValue.parcel;
      this.item.quality = formValue.quality;
      this.save.emit(this.item);
      this.activeModal.close('Save click');
    } else {
      console.error('Form geçerli değil:', this.editForm.errors);
    }
  }

  closeModal() {
    this.activeModal.close('Close click');
  }
}
