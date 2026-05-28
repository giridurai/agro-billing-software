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
    ]
  }
];
