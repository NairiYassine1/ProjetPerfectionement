// ...existing code...
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client-service';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './authentification.html',
  styleUrls: ['./authentification.css']
})
export class AuthentificationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private clientService = inject(ClientService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // change password flow
  mustChangePassword = false;
  currentClientId: string | null = null;
  // password must be between 6 and 10 chars, contain at least 3 digits and 1 special char
  private PASSWORD_PATTERN = '^(?=(?:.*\\d){3,})(?=.*[^A-Za-z0-9]).+$';

  changeForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10), Validators.pattern(this.PASSWORD_PATTERN)]],
    confirm: ['', [Validators.required]]
  });

  // password visibility toggles
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')!.value as string;
    const password = this.loginForm.get('password')!.value as string;
    this.clientService.login(email, password).subscribe({
      next: (res: any) => {
        // success: res = { clientId, mustChangePassword }
        if (res.mustChangePassword) {
          this.mustChangePassword = true;
          this.currentClientId = res.clientId;
          return;
        }
        // store clientId locally and navigate
        localStorage.setItem('clientId', res.clientId);
        this.router.navigate(['/client-dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Identifiants invalides');
      }
    });
  }

  submitChange() {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }
    const np = this.changeForm.get('newPassword')!.value as string;
    const conf = this.changeForm.get('confirm')!.value as string;
    if (np !== conf) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (!this.currentClientId) return;
    this.clientService.changePassword(this.currentClientId!, np).subscribe({
      next: () => {
        localStorage.setItem('clientId', this.currentClientId!);
        this.router.navigate(['/client-dashboard']);
      },
      error: (err) => {
        console.error('Change password failed', err);
        alert('Erreur lors du changement de mot de passe');
      }
    });
  }
}
