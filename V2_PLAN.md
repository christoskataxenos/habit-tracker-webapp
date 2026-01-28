# Πλάνο Αναβάθμισης Study Tracker V2.0 🚀

Αυτό το έγγραφο περιγράφει τα βήματα για τη μετάβαση από την V1 στην V2, βασισμένο στις απαιτήσεις για βελτιωμένη αρχιτεκτονική, απόδοση και προηγμένα analytics.

---

## 🛠 Φάση 1: Υποδομή & Τεχνολογικό Stack (The "Foundation")
*Στόχος: Η προετοιμασία του κώδικα για επεκτασιμότητα και ασφάλεια τύπων.*

- [x] **TypeScript Migration**
    - [x] Εγκατάσταση και ρύθμιση του TypeScript (`tsconfig.json`).
    - [x] Μετατροπή των αρχείων από `.js/.jsx` σε `.ts/.tsx`. *(Entry points + Dashboard ολοκληρώθηκαν)*
    - [x] Ορισμός βασικών Interfaces για Habits, Sessions, UserProfile, Stats. (`types.ts`)
- [x] **State Management (Zustand)**
    - [x] Εγκατάσταση του `zustand`.
    - [x] Δημιουργία stores (`useEntryStore`, `useSettingsStore`, `useRoutineStore`).
    - [x] Αντικατάσταση του Context/Local State όπου χρειάζεται. *(Dashboard.tsx - ολοκληρώθηκε)*
- [x] **Repo Cleanup**
    - [x] Αφαίρεση του Docker (Dockerfile, docker-compose.yml κτλ).
    - [x] Καθαρισμός αχρησιμοποίητων dependencies. *(Αφαιρέθηκαν Capacitor/Android)*

## 💾 Φάση 2: Δεδομένα & Αρχιτεκτονική (The "Brain")
*Στόχος: Μετάβαση από απλό LocalStorage σε μια πιο ισχυρή και αποδοτική λύση.*

- [x] **Hybrid DB Architecture**
    - [x] Υλοποίηση της **IndexedDB** (μέσω `dexie.js`) για αποθήκευση μεγάλου όγκου δεδομένων. (`db/index.ts`)
    - [x] Δυνατότητα SQL-like queries για analytics.
    - [x] Migration utility για μεταφορά από localStorage. (`db/migration.ts`)
- [x] **TOON Data Exchange**
    - [x] Χρήση του **TOON format** για εισαγωγή/εξαγωγή δεδομένων. (`db/toon.ts`)
    - [x] Υλοποίηση parsers για μετατροπή από/προς JSON/TOON.
- [x] **Manual Cloud Backup Support**
    - [x] Ανάπτυξη οδηγιών (Step-by-step) για το πώς ο χρήστης μπορεί να αποθηκεύει τα TOON αρχεία του στο Cloud. (`BACKUP_GUIDE.md`)
    - [x] Ενίσχυση της φιλοσοφίας "Full User Control" (Local-first).

## 🎨 Φάση 3: UI/UX & Απόδοση (The "Face")
*Στόχος: Βελτίωση της αναγνωσιμότητας και της ταχύτητας της εφαρμογής.*

- [x] **UI Polish & Optimization**
    - [x] Μείωση των Glassmorphic εφέ (blur/transparency) για βελτίωση του GPU performance.
        - Reduced `backdrop-blur-2xl` → `backdrop-blur-md` (glass-silver)
        - Reduced `backdrop-blur-xl` → `backdrop-blur-sm` (modals)
    - [x] Απενεργοποίηση animation στη Pie Chart για ταχύτερο rendering.
    - [ ] Βελτίωση τυπογραφίας και spacing για καλύτερη αναγνωσιμότητα.
- [x] **Advanced Visuals**
    - [x] **Heatmaps**: GitHub-style activity heatmap component. (`components/ActivityHeatmap.tsx`)
        - Grid visualization με 12 εβδομάδες δραστηριότητας
        - Intensity levels βάσει ωρών μελέτης
        - Streak tracking
        - Light/Dark mode support
    - [x] Integration στο Dashboard (Feed Panel - Month view)
    - [x] Integration στο Analytics Modal (Quarter view)
    - [x] Σύστημα "Lvl Up" visuals για το Architect Rank.
        - Updated Ranks: **NOVICE** → **APPRENTICE** → **ADEPT** → **EXPERT** → **ARCHITECT**
        - New Rank Icons & Colors in Header HUD.

## 📊 Φάση 4: Analytics & Επιστημονική Προσέγγιση (The "Intelligence")
*Στόχος: Παροχή ουσιαστικών insights στον χρήστη.*

- [ ] **Correlations Engine**
    - [ ] Ανάπτυξη αλγορίθμου που συνδέει διαφορετικά habits (π.χ. Ύπνος vs Workouts).
- [ ] **Predictive Analytics**
    - [ ] Υλοποίηση Linear Regression για την πρόβλεψη της προόδου.
- [ ] **Web Workers**
    - [ ] Μεταφορά των βαριών υπολογισμών stats σε Web Workers για να μην "παγώνει" το UI.

## 💻 Φάση 5: System Integration (The "Integration")
*Στόχος: Καλύτερη ενσωμάτωση στο λειτουργικό σύστημα.*

- [ ] **Mini-Focus HUD**
    - [ ] Δημιουργία ενός compact "Always-on-Top" παραθύρου (HUD).
- [ ] **System Tray Integration**
    - [ ] Υλοποίηση background persistence.
    - [ ] Tray menu για γρήγορο logging.
- [ ] **Export Engine**
    - [ ] Δημιουργία "Pulse Architect" reports σε PDF και Image format.

## 🧪 Φάση 6: Διασφάλιση Ποιότητας & Testing
- [ ] **Unit Testing** (Vitest) για τους αλγόριθμους XP και stats.
- [ ] **Integration Testing** για τα stores και το DB layer.

---

### 📝 Σημειώσεις:
- Κάθε αλλαγή στον κώδικα θα συνοδεύεται από σχόλια στα Ελληνικά (όπως ζητήθηκε).
- Η χρήση του **TOON** θα είναι κεντρική για το AI-ready portability.
