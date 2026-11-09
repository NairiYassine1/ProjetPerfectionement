import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClientService } from '../../services/client-service';

@Component({
  selector: 'app-ouverture-compte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ouverture-compte.html',
  styleUrls: ['./ouverture-compte.css']
})
export class OuvertureCompteComponent implements OnInit {
  currentStep = 1;
  isSubmitting = false;
  requestId: string | null = null;
  accountStatus: string | null = null;

  showConfirmation = false;
  showMismatchModal = false;
  mismatchMessage: string | null = null;
  // helper message visibility for the email field
  showEmailHelper = true;

  steps = [
    { id: 1, label: 'Informations personnelles' },
    { id: 2, label: 'Coordonnées' },
    { id: 3, label: 'Vérification identité' },
    { id: 4, label: 'Préférences compte' },
    { id: 5, label: 'Conditions & versement' },
    { id: 6, label: 'Validation finale' }
  ];

  accountForm!: FormGroup;
  // date input bounds for template (YYYY-MM-DD)
  minDate!: string; // 100 years ago
  maxDate!: string; // 18 years ago
  blacklistedError: string | null = null;
  checkingCin = false;
  checkingMessage: string | null = null;

  constructor(private fb: FormBuilder, private clientService: ClientService) {}

  ngOnInit() {
    // compute min/max dates for date input (blocks future dates and enforces 18..100 range)
    const today = new Date();
    const date18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const date100 = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const toIso = (d: Date) => d.toISOString().slice(0,10);
    this.maxDate = toIso(date18);
    this.minDate = toIso(date100);
    this.accountForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/u)]],
      nom: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/u)]],
      cin: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/), Validators.minLength(8), Validators.maxLength(8)]],
      dateNaissance: ['', [Validators.required, this.adultValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email, this.gmailValidator.bind(this)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/), Validators.minLength(8), Validators.maxLength(8)]],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      gouvernorat: ['', Validators.required],
      paysResidence: ['Tunisie', Validators.required],
      cinFile: ['', Validators.required],
      fichePaieFile: ['', Validators.required],
      typeCompte: ['particulier', Validators.required],
      domaineActivite: ['', Validators.required],
      profession: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      versementInitial: [300, [Validators.required, Validators.min(300)]]
    });

    // clear blacklist error when CIN field changes
    const cinCtrl = this.accountForm.get('cin');
    if (cinCtrl) {
      cinCtrl.valueChanges.subscribe((v) => {
        this.blacklistedError = null;
        const ctrl = this.accountForm.get('cin');
        if (ctrl) {
          const errs = ctrl.errors ? { ...ctrl.errors } : null;
          if (errs && errs['blacklisted']) {
            delete errs['blacklisted'];
            const remaining = Object.keys(errs).length ? errs : null;
            ctrl.setErrors(remaining);
          }
        }
      });
    }
  }

  dismissEmailHelper() {
    this.showEmailHelper = false;
  }

  // custom validator: must be between 18 and 100 years old, and not in the future
  adultValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // required handled elsewhere
    const dob = new Date(value);
    if (isNaN(dob.getTime())) return { invalidDate: true };
    const today = new Date();
    // block future dates
    if (dob > today) return { inFuture: true };

    const age = this._calculateAge(dob, today);
    if (age < 18) return { tooYoung: true };
    if (age > 100) return { tooOld: true };
    return null;
  }

  private _calculateAge(dob: Date, ref: Date): number {
    let age = ref.getFullYear() - dob.getFullYear();
    const m = ref.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--;
    return age;
  }

  // Allow only digit keystrokes
  allowDigits(event: KeyboardEvent) {
    // allow navigation keys, backspace, etc.
    if (event.key.length > 1) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // sanitize pasted content and input content to digits only
  onDigitsInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const digits = input.value.replace(/[^0-9]/g, '').slice(0, 8);
    if (input.value !== digits) {
      input.value = digits;
      const ctrl = this.accountForm.get(controlName);
      if (ctrl) {
        ctrl.setValue(digits);
        ctrl.markAsDirty();
      }
    }
  }

  onPasteDigits(event: ClipboardEvent, controlName: string) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (!/^[0-9]+$/.test(pasted)) {
      event.preventDefault();
      // if we still want to paste filtered digits
      const digits = pasted.replace(/[^0-9]/g, '').slice(0,8);
      const ctrl = this.accountForm.get(controlName);
      if (ctrl) ctrl.setValue(digits);
    }
  }

  // sanitize name inputs (allow letters, spaces and accents)
  onNameInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const cleaned = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    if (input.value !== cleaned) {
      input.value = cleaned;
      const ctrl = this.accountForm.get(controlName);
      if (ctrl) ctrl.setValue(cleaned);
    }
  }

  // Date input helper: user types digits and slashes are inserted automatically (jj/mm/aaaa)
  

  isStepValid(step: number): boolean {
    const c = this.accountForm.controls;
    switch(step) {
      case 1: return c['prenom'].valid && c['nom'].valid && c['cin'].valid && c['dateNaissance'].valid;
      case 2: return c['email'].valid && c['mobile'].valid && c['adresse'].valid && c['ville'].valid && c['gouvernorat'].valid;
      case 3: return c['cinFile'].valid && c['fichePaieFile'].valid;
      case 4: return c['typeCompte'].valid;
      case 5: return c['acceptTerms'].value && c['versementInitial'].valid;
      default: return true;
    }
  }

  // progress percentage for vertical bar (0..100)
  get progressPercent(): number {
    if (!this.steps || this.steps.length <= 1) return 100;
    // show progress from 0% at step 1 to 100% at last step
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  // custom validator: email must end with @gmail.com
  gmailValidator(control: AbstractControl) {
    const v = control.value;
    if (!v) return null;
    return /@gmail\.com$/i.test(v) ? null : { notGmail: true };
  }

  nextStep() {
    if(this.isStepValid(this.currentStep) && this.currentStep < this.steps.length) this.currentStep++;
  }
  confirmNext() {
  const controls = this.getControlsForStep(this.currentStep);

  // mark current step controls as touched
  controls.forEach(name => {
    const ctrl = this.accountForm.get(name);
    if (ctrl) {
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity();
    }
  });

  // STOP if step invalid
  if (!this.isStepValid(this.currentStep)) {
    return;
  }

  // Special case: CIN blacklist check
  if (this.currentStep === 1) {
    const cinVal = this.accountForm.get('cin')?.value;
    if (!cinVal) return;

    this.checkingCin = true;
    this.checkingMessage = 'Vérification du CIN en cours...';

    this.clientService.checkBlacklist(cinVal).subscribe({
      next: (isBlack) => {
        this.checkingCin = false;
        this.checkingMessage = null;

        if (isBlack) {
          this.blacklistedError = 'Le CIN est sur la liste noire.';
          const ctrl = this.accountForm.get('cin');
          ctrl?.setErrors({ ...(ctrl.errors || {}), blacklisted: true });
          return;
        }

        this.nextStep();
      },
      error: () => {
        this.checkingCin = false;
        this.checkingMessage = null;
      }
    });

    return;
  }

  this.nextStep();
}

  // return the form control names that belong to a given step
  getControlsForStep(step: number): string[] {
    switch(step) {
      case 1: return ['prenom','nom','cin','dateNaissance'];
      case 2: return ['email','mobile','adresse','ville','gouvernorat'];
      case 3: return ['cinFile','fichePaieFile'];
      case 4: return ['typeCompte','profession','domaineActivite'];
      case 5: return ['acceptTerms','versementInitial'];
      default: return [];
    }
  }

  prevStep() {
    if(this.currentStep > 1) this.currentStep--;
  }

  /**
   * Navigate to a specific step when a step item is clicked.
   * - always allow backward navigation
   * - when attempting to go forward, only allow if current step is valid
   * - reuse confirmNext() for special-case checks (e.g. CIN blacklist)
   */
  goToStep(stepId: number) {
    if (stepId === this.currentStep) return;

    if (stepId < this.currentStep) {
      // always allow going backward
      this.currentStep = stepId;
      return;
    }

    // going forward: if current step is invalid, do nothing
    if (!this.isStepValid(this.currentStep)) return;

    // If special asynchronous checks exist for the current step (e.g. step 1), reuse confirmNext()
    if (this.currentStep === 1) {
      this.confirmNext();
      return;
    }

    // Otherwise allow jump forward
    this.currentStep = stepId;
  }

  onFileChange(event: any, controlName: string) {
    if(event.target.files.length > 0) {
      this.accountForm.get(controlName)?.setValue(event.target.files[0]);
    }
  }

  removeFile(controlName: string, inputElem?: HTMLInputElement) {
    const ctrl = this.accountForm.get(controlName);
    if (ctrl) {
      ctrl.setValue(null);
      ctrl.markAsDirty();
      ctrl.updateValueAndValidity();
    }
    if (inputElem) {
      try { inputElem.value = ''; } catch(e) { /* ignore */ }
    }
  }

  onSubmit() {
  console.log('onSubmit called - valid:', this.accountForm.valid);
  if (!this.accountForm.valid) {
  this.accountForm.markAllAsTouched();
  return;

  }

  this.isSubmitting = true;

  const clientObj: any = {
    prenom: this.accountForm.get('prenom')?.value,
    nom: this.accountForm.get('nom')?.value,
    cin: this.accountForm.get('cin')?.value,
    email: this.accountForm.get('email')?.value,
    telephone: this.accountForm.get('mobile')?.value,
    adresse: this.accountForm.get('adresse')?.value,
    ville: this.accountForm.get('ville')?.value,
    pays: this.accountForm.get('paysResidence')?.value,
    dateNaissance: this.accountForm.get('dateNaissance')?.value,
    profession: this.accountForm.get('profession')?.value
  };
  // include initial deposit so backend can persist the account solde
  

  const formData = new FormData();
  formData.append('client', JSON.stringify(clientObj));
  // append versementInitial at AccountRequest level (separate form part)
  const versementVal = this.accountForm.get('versementInitial')?.value;
  if (versementVal !== undefined && versementVal !== null) {
    formData.append('versementInitial', String(versementVal));
  }

  // include files in the initial multipart payload so backend @RequestParam can receive them
  const cinFile = this.accountForm.get('cinFile')?.value;
  const ficheFile = this.accountForm.get('fichePaieFile')?.value;
  if (cinFile) formData.append('cinFile', cinFile);
  if (ficheFile) formData.append('fichePaieFile', ficheFile);

    this.clientService.ouvrirCompte(formData).subscribe({
      next: (res: any) => {
        this.requestId = res.id;
        console.log('Create response:', res);
        console.log('Stored requestId:', this.requestId);

        const reason = res.rejectionReason;
        if (reason === 'OCR_CIN_MISMATCH') {
          this.isSubmitting = false;
          this.mismatchMessage = 'Le CIN saisi ne correspond pas au document téléchargé. Vérifiez le formulaire ou remplacez le fichier.';
          this.showMismatchModal = true;
          return;
        }
        // accept both variants that might be set server-side
        if (reason === 'OCR_NO_CIN' || reason === 'OCR_NO_CIN_FOUND') {
          this.isSubmitting = false;
          this.mismatchMessage = 'Impossible d’extraire le CIN du document. Vérifiez la photo du CIN et réessayez.';
          this.showMismatchModal = true;
          return;
        }

        // default: show normal confirmation
        this.showConfirmation = true;
        this.isSubmitting = false;

        // Note: CIN and fiche de paie were already included in the initial multipart submission above.
        // The backend processes and saves those documents (and runs OCR) during the initial request,
        // so we should NOT re-upload them here — doing so caused duplicate Document entries.

        // Fetch status after initial processing and trigger compliance check.
        if (this.requestId) {
          this.clientService.getAccountRequestById(this.requestId)
            .subscribe({
              next: (req: any) => {
                this.accountStatus = req.status;
                console.log('Status after submit:', this.accountStatus);

                this.clientService.runCompliance(this.requestId!)
                  .subscribe({
                    next: (res: any) => {
                      this.accountStatus = res.status;
                      console.log('Final status after compliance:', this.accountStatus);
                    },
                    error: (err) => console.error('Compliance error', err)
                  });
              },
              error: (err) => console.error('Status fetch error', err)
            });
        }
      },

      error: (err) => {
        this.isSubmitting = false;
        console.error('Submit error', err);
      }
    });
}

  // Called when user chooses to review/modify the form after mismatch
  reviewFormAfterMismatch() {
    this.showMismatchModal = false;
    this.currentStep = 1;
    this.accountForm.get('cin')?.markAsTouched();
    this.accountForm.get('cin')?.updateValueAndValidity();
  }

  // Called when user chooses to continue despite mismatch
  continueDespiteMismatch() {
    this.showMismatchModal = false;
    this.showConfirmation = true;
  }
}
