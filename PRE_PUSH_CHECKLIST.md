# 🏁 Pre-Push / Pre-Release Checklist

Χρησιμοποίησε αυτή τη λίστα πριν από κάθε `git push` ή `Build` για να αποφύγεις τα "Oops" commits και τα bugs της τελευταίας στιγμής.

## 🛠️ 1. Βασική Λειτουργικότητα (Core Flow)
- [ ] **Create**: Μπορώ να προσθέσω νέα καταχώρηση (Manual & Timer);
- [ ] **Edit**: Όταν κάνω Edit μια καταχώρηση, εμφανίζονται σωστά όλα τα πεδία (Subject, Time, Tag, Score, Topic);
- [ ] **Delete**: Η διαγραφή λειτουργεί σωστά στο κεντρικό Feed ΚΑΙ στο Day Detail;
- [ ] **Search**: Το search φιλτράρει σωστά τις καταχωρήσεις;

## 🎨 2. UI & UX (The "Juice")
- [ ] **Responsive Check**: Φαίνεται σωστά το app αν μικρύνω το παράθυρο (π.χ. το Log Entry modal);
- [ ] **Light/Dark Mode**: Η εναλλαγή λειτουργεί παντού; (Check Analytics, Settings, Modals).
- [ ] **Animations**: Τα modals ανοίγουν ομαλά; Το Confetti πετάει στο επιτυχημένο save;
- [ ] **Charts**: Τα γραφήματα φορτώνουν ή βγάζουν "No data" αν δεν υπάρχει τίποτα;

## 📊 3. Δεδομένα & Ασφάλεια
- [ ] **Vault Test**: Έκανα ένα Export JSON; Το αρχείο που κατέβηκε φαίνεται σωστό;
- [ ] **CSV Check**: Το νέο CSV Export ανοίγει σωστά σε Excel;
- [ ] **Local Storage**: Αν κάνω Refresh (F5), τα δεδομένα μου παραμένουν στη θέση τους;
- [ ] **Error Boundary**: Αν προκαλέσω (επίτηδες) ένα σφάλμα, εμφανίζεται το custom "Oops" screen ή λευκή οθόνη;

## ⚙️ 4. System & Tech (Developer Check)
- [ ] **Console Hygiene**: Πάτα `F12`. Υπάρχουν κόκκινα Errors ή παράξενα Warnings (π.χ. Recharts width);
- [ ] **Environment**: Υπάρχει το `.env` αρχείο; Μήπως ξέχασα κάποιο hardcoded path;
- [ ] **Unused Code**: Έψαξα για `console.log` που ξέμειναν; Υπάρχουν αχρησιμοποίητα imports;
- [ ] **Build Process**: Τρέχει το `npm run build` χωρίς σφάλματα;

## 🚀 5. Git & Distribution
- [ ] **Version Update**: Άλλαξα το version στο `package.json` αν πρόκειται για release;
- [ ] **Gitignore**: Μήπως πάω να κάνω push αρχεία που δεν πρέπει (π.χ. `tobefixed.txt`, `node_modules`, `.env`);
- [ ] **Roadmap**: Ενημέρωσα το `v1.6_roadmap.md` με τα τελευταία [x];

---
*💡 tip: Πριν το τελικό push, κάνε ένα τελευταίο `npm run dev` και κλίκαρε γρήγορα όλα τα κουμπιά (Stress Test).*
