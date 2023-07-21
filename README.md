# HealthDataWebApp

**Greek:**

**- Σχετικά με την εφαρμογή: -**

Η εφαρμογή HealthDataWebApp φτιάχτηκε στα πλαίσια της πτυχιακής εργασίας, που έχει ως θέμα την άντληση δεδομένων υγείας σε μορφή Open mHealth JSON σχήματα, τον μετασχηματισμό τους σε RDF γράφους, την αποθήκευση τους στην σημασιολογική βάση δεδομένων GraphDB και την προβολή τους μέσω μιας web εφαρμογής. Η συγκεκριμένη εφαρμογή υλοποιεί την προβολή των μετρήσεων που έγιναν. Η προβολή των μετρήσεων γίνεται με μορφή πίνακα και με μορφή γραφήματος. Οι μετρήσεις βρίσκονται αποθηκευμένες σε ένα repository του GraphDB με όνομα "HealthData". Οι επιλογές και τα αποτελέσματα που προβάλονται στην εφαρμογή προκύπτουν με τη χρήση SPARQL ερωτημάτων που γίνονται στο GraphDB repository. Η επικοινωνία μεταξύ εφαρμογής και GraphDB πραγματοποιείται από το αρχείο script.js με τη χρήση POST αιτημάτων.



**Οδηγίες χρήσης:**

1. Με το άνοιγμα του HealthData.html εμφανίζεται η αρχική οθόνη της web εφαρμογής.
2. Ο χρήστης πρέπει να επιλέξει το «Choose patient» για να εμφανιστούν όλοι οι χρήστες-ασθενείς για τους οποίους έχει γίνει η καταγραφή των δεδομένων τους.
3. Μετά την επιλογή του ονόματος, εμφανίζονται οι τύποι των δεδομένων που αντιστοιχούν στον ασθενή που επιλέχθηκε.
4. Ο χρήστης σε αυτό το σημείο πρέπει να επιλέξει έναν τύπο δεδομένων και να ορίσει τη χρονική διάρκεια για την οποία ενδιαφέρεται, ορίζοντας την πρώτη και τελευταία μέρα.
5. Στη συνέχεια επιλέγει submit για να εμφανιστούν τα αποτελέσματα, ή back για να επιστρέψει στην αρχική οθόνη.
6. Με την επιλογή του "Submit" εμφανίζονται δύο είδη αποτελεσμάτων. Το ένα είναι ένας πίνακας και το άλλο ένα γράφημα.

==================================================

**English:**

**- About the app: -**

The HealthDataWebApp application was built as part of the thesis, which is about retrieving health data in the form of Open mHealth JSON schemas, transforming them into RDF graphs, storing them in the GraphDB semantic database and displaying them through a web application. This application implements the viewing of the measurements taken. The projection of the measurements is done in tabular and graph form. The measurements are stored in a GraphDB repository named "HealthData". The options and results displayed in the application are derived using SPARQL queries made to the GraphDB repository. The communication between the application and GraphDB is performed by the script.js file using POST requests.


**Instructions for use:**

1. Opening HealthData.html displays the home screen of the web application.
2. The user must select "Choose patient" to display all the patient users for whom data has been recorded.
3. After selecting the name, the data types corresponding to the selected patient are displayed.
4. The user at this point must select a data type and set the duration of time for which they are interested, setting the first and last day.
5. He then selects submit to display the results, or back to return to the home screen.
6. Selecting submit displays two types of results. One is a table and the other is a graph.
