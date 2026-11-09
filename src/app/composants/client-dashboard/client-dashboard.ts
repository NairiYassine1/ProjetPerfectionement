import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css']
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);

  loading = true;
  errorMsg: string | null = null;

  request: any = null;
  // contract preview data
  contractPreview: any = null;
  contractVisible = false;

  ngOnInit(): void {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      // not logged in — redirect to auth page
      this.router.navigate(['/auth']);
      return;
    }

    this.clientService.getAccountRequestByClientId(clientId).subscribe({
      next: (res: any) => {
        this.request = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load account request', err);
        this.errorMsg = 'Impossible de charger la demande. Réessayez plus tard.';
        this.loading = false;
      }
    });
  }

  get statusLabel(): string {
    switch (this.request.status) {
      case 'PENDING_VALIDATION': return 'En attente de validation';
      case 'APPROVED': return 'Compte approuvé';
      case 'SIGNED': return 'Contrat signé';
      case 'REJECTED': return 'Demande rejetée';
      default: return this.request.status;
    }
  }

  get statusClass(): string {
    switch (this.request.status) {
      case 'PENDING_VALIDATION': return 'status-warning';
      case 'APPROVED': return 'status-success';
      case 'SIGNED': return 'status-success';
      case 'REJECTED': return 'status-danger';
      default: return '';
    }
  }
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 2 }).format(amount);
    } catch (e) {
      return String(amount);
    }
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('fr-FR');
    } catch (e) {
      return '—';
    }
  }
  downloadContract() {
  if (!this.contractPreview) return;

  const content = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Contrat - ${this.contractPreview.requestId}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:20px} .header{display:flex;align-items:center;gap:16px} .signed{color:#0b3a82;font-weight:700;border:2px dashed #0b3a82;padding:12px;display:inline-block}</style>
</head>
<body>
  <div class="header">
    <img src="${this.contractPreview.logo}" alt="logo" style="height:56px" />
    <div>
      <h2>CONVENTION D'OUVERTURE DE COMPTE</h2>
      <div>Référence: ${this.contractPreview.requestId}</div>
    </div>
  </div>
  <hr/>
  <div>
    <p><strong>Client :</strong> ${this.contractPreview.clientFullName || ''}</p>
    <p><strong>CIN :</strong> ${this.contractPreview.cin || ''}</p>
    <p><strong>Email :</strong> ${this.contractPreview.email || ''}</p>
    <p><strong>Type de compte :</strong> ${this.contractPreview.accountType || ''}</p>
    <p><strong>Date d'approbation :</strong> ${this.contractPreview.approvalDate || ''}</p>

    <h4>Article 1 — Objet</h4>
    <p>${this.contractPreview.legalText || ''}</p>

    <h4>Article 2 — Conditions</h4>
    <p>Le titulaire s'engage à respecter les conditions générales applicables aux produits et services fournis par BIAT.</p>

    ${this.contractPreview.signed ? `<div class="signed">SIGNÉ ÉLECTRONIQUEMENT — ${this.contractPreview.signedAt || ''} — Ref: ${this.contractPreview.requestId}</div>` : ''}
  </div>
</body>
</html>`;

  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const filename = `contrat-${this.request?.id || this.contractPreview.requestId}.html`;
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}


  generateContract() {
    if (!this.request || !this.request.id) return;
    this.clientService.getContractPreview(this.request.id).subscribe({
      next: (res: any) => {
        this.contractPreview = res;
        this.contractVisible = true;
      },
      error: (err) => {
        console.error('Failed to load contract preview', err);
        alert('Impossible de générer l\'aperçu du contrat.');
      }
    });
  }

  signContract() {
    if (!this.request || !this.request.id) return;
    this.clientService.signContract(this.request.id).subscribe({
      next: (res:any) => {
        // refresh request and preview
        const clientId = localStorage.getItem('clientId')!;
        this.clientService.getAccountRequestByClientId(clientId).subscribe({
          next: (r:any) => {
            this.request = r;
            this.clientService.getContractPreview(this.request.id).subscribe({ next:(p:any)=>{ this.contractPreview = p; this.contractVisible = true; }, error: ()=>{} });
          }, error: ()=>{}
        });
      },
      error: (err) => {
        console.error('Sign failed', err);
        alert('Erreur lors de la signature');
      }
    });
  }
}
