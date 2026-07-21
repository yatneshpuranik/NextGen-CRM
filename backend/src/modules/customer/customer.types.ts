export interface CreateCustomerDTO {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  customerType: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  customerType?: string;
  notes?: string;
}

export interface GetCustomersQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  customerType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
