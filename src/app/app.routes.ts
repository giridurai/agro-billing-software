import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { CompanyComponent } from './company/company';
import { InvoiceComponent } from './invoice/invoice';
import { Homepage } from './homepage/homepage';
import { LoginComponent } from './login/login';
import { UserComponent } from './user/user';
import { QuotationComponent } from './quotation/quotation';
import { ProductMasterComponent } from './product-master/product-master';
import { MainLayoutComponent } from './layout/main-layout';
import { SettingsComponent } from './settings/settings';

// Agro Billing Modules
import { SuppliersComponent } from './suppliers/suppliers';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase-invoice';
import { ReturnsComponent } from './returns/returns';
import { ReportsComponent } from './reports/reports';
import { StockManagementComponent } from './inventory/stock-management/stock-management';

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
        path: 'quotation',
        component: QuotationComponent,
      },
      {
        path: 'homepage',
        component: Homepage,
      },
      {
        path: 'User',
        component: UserComponent,
      },
      {
        path: 'product-master',
        component: ProductMasterComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
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
        path: 'stock-management',
        component: StockManagementComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
    ]
  }
];
