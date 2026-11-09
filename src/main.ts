import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { App } from './app/app';
import { AppRoutingModule } from './app/app-routing-module';

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(BrowserModule, ReactiveFormsModule, AppRoutingModule),
    provideHttpClient(),
    provideBrowserGlobalErrorListeners()
  ]
}).catch(err => console.error(err));
