import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OuvertureCompteComponent } from './composants/ouverture-compte/ouverture-compte';
import { AdminDashboardComponent } from './composants/admin-dashboard/admin-dashboard';
import { AppRoutingModule } from './app-routing-module';
import { TopNavComponent } from './composants/home/top-nav/top-nav';
import { Home } from './composants/home/home';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, TopNavComponent, OuvertureCompteComponent, AdminDashboardComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('biat-frontend');
}
