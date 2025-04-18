export interface Vendor {
    _id: string;
    name: string;
    contact: string;
    phone: string;

  
  }

 export interface VendorItem {
    _id: string;
    vendorId: string;
    itemId: string;
  }