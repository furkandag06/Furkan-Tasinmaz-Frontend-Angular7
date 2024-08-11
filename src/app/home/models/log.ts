export class Log {
  id?: number;
  kullaniciId: number;
  durum: string;
  islemTip: string;
  aciklama: string;
  tarihveSaat: Date;
  kullaniciTip: 'user' | 'admin';
  selected?: boolean;
  role: string; // Rol bilgisini ekleyin
}