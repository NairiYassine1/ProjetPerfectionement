import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopNavComponent } from './top-nav/top-nav';
import { CreditCardComponent } from './credit-card/credit-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TopNavComponent, CreditCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {}
