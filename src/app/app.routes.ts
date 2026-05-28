import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { CompanyComponent } from './company/company';
import { InvoiceComponent } from './invoice/invoice';
import { EnquiryComponent } from './enquiry/enquiry';
import { Homepage } from './homepage/homepage';
import { ContactComponent } from './contact/contact';
import { LoginComponent } from './login/login';
import { UserComponent } from './user/user';
import { QuotationComponent } from './quotation/quotation';
import { IteamMaster } from './iteam-master/iteam-master';
import { MainLayoutComponent } from './layout/main-layout';
import { SettingsComponent } from './settings/settings';

// New Agro Billing Modules
import { SuppliersComponent } from './suppliers/suppliers';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase-invoice';
import { ReturnsComponent } from './returns/returns';
import { StockInwardComponent } from './inventory/stock-inward/stock-inward';
import { StockOutwardComponent } from './inventory/stock-outward/stock-outward';
import { WarehouseComponent } from './inventory/warehouse/warehouse';
import { ReportsComponent } from './reports/reports';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'company',
        component: CompanyComponent,
      },
      {
        path: 'invoice',
        component: InvoiceComponent,
      },
      {
        path: 'enquiry',
        component: EnquiryComponent,
      },
      {
        path: 'quotation',
        component: QuotationComponent,
      },
      {
        path: 'homepage',
        component: Homepage,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'User',
        component: UserComponent,
      },
      {
        path: 'iteam',
        component: IteamMaster,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      // New Routes
      {
        path: 'suppliers',
        component: SuppliersComponent,
      },
      {
        path: 'purchase-invoice',
        component: PurchaseInvoiceComponent,
      },
      {
        path: 'returns',
        component: ReturnsComponent,
      },
      {
        path: 'stock-inward',
        component: StockInwardComponent,
      },
      {
        path: 'stock-outward',
        component: StockOutwardComponent,
      },
      {
        path: 'warehouse',
        component: WarehouseComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
    ]
  }
];
