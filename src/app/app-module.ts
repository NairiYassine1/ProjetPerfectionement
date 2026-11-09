import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OuvertureCompteComponent } from './composants/ouverture-compte/ouverture-compte';
import { AdminLayoutComponent } from './composants/admin-layout/admin-layout';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    OuvertureCompteComponent,
    FormsModule,
        AdminLayoutComponent

  ],
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners()
  ],
  // App is a standalone component bootstrapped via `bootstrapApplication` in main.ts
})
export class AppModule { }
