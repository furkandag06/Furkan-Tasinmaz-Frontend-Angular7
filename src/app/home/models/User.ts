export class User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  password: string; // Şifre alanı eklendi
  passwordHash?: string; // Sunucu tarafında hashlenmiş şifre
  passwordSalt?: string; // Şifre tuzu (salt)
  phone: string;
  address: string;
  role: string;
  selected?: boolean; // Checkbox için kullanacağız

  constructor(
      name: string,
      surname: string,
      email: string,
      password: string, // Constructor'a eklendi
      phone: string,
      address: string,
      role: string,
      id?: number,
      passwordHash?: string,
      passwordSalt?: string
  ) {
      this.name = name;
      this.surname = surname;
      this.email = email;
      this.password = password; // Eklendi
      this.phone = phone;
      this.address = address;
      this.role = role;
      this.id = id;
      this.passwordHash = passwordHash;
      this.passwordSalt = passwordSalt;
  }
}
