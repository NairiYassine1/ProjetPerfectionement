import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './composants/home/home';
import { AdminDashboardComponent } from './composants/admin-dashboard/admin-dashboard';
import { OuvertureCompteComponent } from './composants/ouverture-compte/ouverture-compte';
import { AuthentificationComponent } from './composants/authentification/authentification';
import { ErrorComponent } from './composants/error/error';
import { AdminLayoutComponent } from './composants/admin-layout/admin-layout';
import { ClientDashboardComponent } from './composants/client-dashboard/client-dashboard';

const routes: Routes = [
  {
    path: '',
    title: 'Accueil',
    component: Home
  },
  {
  path: 'admin',
  component: AdminLayoutComponent,
  children: [
    {
      path: '',
      title: 'Tableau de bord administrateur',
      component: AdminDashboardComponent
    }
  ]
}

,
{
  path: 'client-dashboard',
  title: 'Tableau de bord client',
  component: ClientDashboardComponent
}
,
  {
    path: 'ouverture-compte',
    title: 'Ouvrir un compte',
    component: OuvertureCompteComponent
  },
  {
    path: 'client/dashboard',
    title: 'Client Dashboard',
    component: ClientDashboardComponent
  },
  {
    path: 'auth',
    title: 'Connexion / Inscription',
    component: AuthentificationComponent
  },
  {
    path: '**',
    title: 'Introuvable',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
