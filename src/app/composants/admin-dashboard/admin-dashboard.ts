import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client-service';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  searchText = '';
  selectedDocuments: any[] = [];
selectedRequestId: string | null = null;

  demandes: any[] = [];
  // cached counters (recomputed from `demandes` after load)
  totalRequestsCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.clientService.getAccountRequests().subscribe({
      next: (res: any) => {
        // ensure we always have an array (some server responses may be a single object)
        if (Array.isArray(res)) {
          this.demandes = res || [];
        } else if (res) {
          this.demandes = [res];
        } else {
          this.demandes = [];
        }
        this.recomputeCounters();
        console.debug('Loaded account requests, count=', this.demandes.length);
      },
      error: (err) => {
        console.error('Failed to load account requests', err);
      }
    });
  }

  // dashboard counts
  get totalRequests(): number { return this.demandes.length; }
  get pendingValidationRequests(): number { return this.pendingCount; }
  get approvedRequests(): number { return this.approvedCount; }
  get rejectedRequests(): number { return this.rejectedCount; }

  private recomputeCounters() {
    this.totalRequestsCount = this.demandes.length;
    this.pendingCount = this.demandes.filter(d => d.status === 'PENDING_VALIDATION').length;
    // Treat SIGNED as approved for dashboard counts
    this.approvedCount = this.demandes.filter(d => d.status === 'APPROVED' || d.status === 'SIGNED').length;
    this.rejectedCount = this.demandes.filter(d => d.status === 'REJECTED').length;
  }

  filteredRequests() {
  return this.demandes.filter(req =>
    (req.client?.nom || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
    (req.client?.prenom || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
    (req.client?.email || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
    (req.client?.cin || '').includes(this.searchText)
  );
}


  validate(id: string) {
    this.clientService.approveRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error('Approve failed', err)
    });
  }

  reject(id: string) {
    this.clientService.rejectRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error('Reject failed', err)
    });
  }
  canValidate(d: any): boolean {
  return d.status === 'PENDING_VALIDATION';
}

canReject(d: any): boolean {
  return d.status === 'PENDING_VALIDATION';
}

getStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT': return 'Brouillon';
    case 'DOCUMENTS_UPLOADED': return 'Documents reçus';
    case 'PENDING_VALIDATION': return 'En attente validation';
    case 'APPROVED': return 'Approuvée';
    case 'REJECTED': return 'Rejetée';
    case 'BLACKLISTED': return 'Blacklistée';
    default: return status;
  }
}
loadDocuments(reqId: string) {
    // Toggle: if already selected, collapse; otherwise load and expand
    if (this.selectedRequestId === reqId) {
      this.selectedRequestId = null;
      this.selectedDocuments = [];
      return;
    }

    this.selectedRequestId = reqId;

    this.clientService.getDocumentsByRequest(reqId).subscribe({
      next: (docs) => {
        this.selectedDocuments = docs;
      },
      error: (err) => {
        console.error('Documents load error', err);
      }
    });
}


}
