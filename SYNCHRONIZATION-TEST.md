# Test Sincronizare Task-uri & Echipamente

## Cum să testezi sincronizarea în timp real:

### Pasul 1: Deschide dashboard-ul Admin
1. Accesează `index.html` sau `login.html`
2. Autentifică-te ca **admin** (user: admin, pass: admin123)
3. Navighează la secțiunea **"Assign Tasks"**

### Pasul 2: Creează un Task nou
1. Apasă butonul **"+ Add Task"**
2. Completează formularul:
   - Title: "Test Task - Install Windows"
   - Description: "Install all windows on floor 2"
   - Location: "Building A - Floor 2"
   - Due Date: alege o dată viitoare
   - Assigned To: selectează **"worker"**
   - Priority: High
3. Apasă **"Save Task"**

### Pasul 3: Creează Equipment nou
1. Navighează la secțiunea **"Equipment Management"**
2. Apasă butonul **"+ New Equipment"**
3. Completează formularul:
   - Equipment Name: "Power Drill"
   - Equipment ID: "EQ-001"
   - Type: "Tool"
   - Condition: "Good"
   - Location: "Building A"
4. Apasă **"Save Equipment"**
5. După salvare, apasă butonul **"Assign"** de lângă echipament
6. Selectează **"worker"** din dropdown
7. Apasă **"Assign Equipment"**

### Pasul 4: Verifică pe dashboard-ul Worker
1. Deschide o nouă fereastră/tab de browser
2. Accesează `login.html` 
3. Autentifică-te ca **worker** (user: worker, pass: worker123)
4. Navighează la secțiunea **"Daily Tasks"**
   - Ar trebui să vezi task-ul creat în coloana **"Pending"**
   - Poți apăsa **"▶️ Start"** pentru a muta task-ul în **"In Progress"**
   - Apoi apasă **"✅ Complete"** pentru a-l marca ca finalizat
5. Navighează la secțiunea **"Assigned Equipment"**
   - Ar trebui să vezi echipamentul asistat (Power Drill)
   - Poți apăsa **"⚠️ Report Issue"** pentru a raporta probleme

### Pasul 5: Testează Sincronizarea în Timp Real
1. Ține ambele ferestre deschise (Admin și Worker)
2. Pe dashboard-ul Admin:
   - Creează un task nou pentru "worker"
   - Asignează un echipament nou pentru "worker"
3. Pe dashboard-ul Worker:
   - **Așteaptă maximum 30 secunde** (auto-refresh)
   - SAU navighează la altă secțiune și revino la Tasks/Equipment
   - Noile task-uri și echipamente ar trebui să apară automat!

### Testare Alternativă cu test-sync.html
Dacă vrei să testezi rapid fără să te autentifici:
1. Deschide `test-sync.html` în browser
2. Apasă **"Create Test Task for Worker"**
3. Apasă **"Create Test Equipment for Worker"**
4. Deschide dashboard-ul Worker (autentificare cu worker/worker123)
5. Navighează la Tasks sau Equipment
6. Ar trebui să vezi datele de test create!

## Funcționalități implementate:

### Admin Dashboard:
✅ **Assign Tasks**
- Creare task-uri noi cu modal
- Editare task-uri existente
- Ștergere task-uri
- Asignare task-uri la lucrători specifici
- Setare prioritate și deadline

✅ **Equipment Management**
- Adăugare echipamente noi
- Editare detalii echipamente
- Asignare echipamente la lucrători
- Returnare echipamente (status = available)
- Marcare ca disponibil manual
- Ștergere echipamente
- Statistici în timp real (Total, Available, Assigned, Maintenance)

### Worker Dashboard:
✅ **Daily Tasks**
- Vizualizare task-uri asignate grupate pe statusuri:
  - 📋 Pending
  - 🔄 In Progress
  - ✅ Completed
- Actualizare status task-uri (Start → Complete)
- Auto-refresh la 30 secunde
- Filtrare automată doar pentru task-urile asignate workerului curent

✅ **Assigned Equipment**
- Vizualizare echipamente asignate
- Afișare condiție echipament (Good/Fair/Poor)
- Raportare probleme/defecțiuni
- Auto-refresh la 30 secunde
- Filtrare automată doar pentru echipamentele asignate workerului curent

## Persistență Date:
- Toate datele sunt salvate în **localStorage**
- Cheile utilizate:
  - `tasks` - array cu toate task-urile
  - `equipment` - array cu toate echipamentele
- Sincronizarea funcționează prin:
  - Admin scrie în localStorage → Worker citește din localStorage
  - Auto-refresh la fiecare 30 secunde pe secțiunile active
  - Refresh manual la schimbarea secțiunii

## Troubleshooting:

**Task-urile nu apar pe Worker dashboard:**
- Verifică că `assignedTo` field este exact username-ul workerului (ex: "worker")
- Verifică că te-ai autentificat corect ca worker
- Așteaptă 30 secunde pentru auto-refresh sau schimbă secțiunea și revino

**Echipamentele nu apar:**
- Verifică că equipment are `status: 'assigned'` și `assignedTo: 'worker'`
- Echipamentele cu status 'available' sau 'maintenance' NU apar pe worker dashboard
- Doar echipamentele asignate explicit workerului curent sunt vizibile

**Date vechi rămân:**
- Deschide `test-sync.html` și apasă **"Clear Data"** pentru a șterge toate task-urile și echipamentele
- Sau deschide Developer Console (F12) și rulează:
  ```javascript
  localStorage.removeItem('tasks');
  localStorage.removeItem('equipment');
  ```
