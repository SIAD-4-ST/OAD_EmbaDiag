
# Outil d'Éco-Conception pour la Filière Champagne

## Description

Ce projet est un outil d'éco-conception destiné à la filière Champagne. Il permet de gérer les diagnostics écologiques des cuvées de Champagne, en tenant compte de divers critères tels que le poids de la bouteille, les matériaux utilisés, le suremballage, et bien plus encore. Les utilisateurs peuvent ajouter, modifier et sauvegarder les diagnostics pour différentes cuvées, ainsi qu'importer et exporter ces données sous forme de fichiers CSV.

## Fonctionnalités

- **Ajout de cuvées** : Ajoutez de nouvelles cuvées à la base de données avec leurs informations de diagnostic respectives.
- **Sauvegarde et exportation des données** : Sauvegardez les diagnostics sous forme de fichier CSV pour un stockage externe ou une analyse.
- **Importation de données** : Importez un fichier CSV contenant des diagnostics pour les cuvées et mettez à jour ou ajoutez de nouvelles cuvées à la base de données.
- **Affichage dynamique** : Les données sont affichées et peuvent être modifiées directement dans l'interface utilisateur.

## Structure du Projet

- **index.html** : La page principale de l'application web.
- **css/styles.css** : Fichier CSS contenant les styles pour l'interface utilisateur.
- **js/poptabledata.js** : Script JavaScript gérant l'affichage dynamique des tableaux et popups/infobulles.
- **js/saveResults.js** : Script JavaScript gérant la sauvegarde, l'exportation, et l'importation des données sous forme de fichiers CSV.
- **js/scripts.js** : Script JavaScript contenant les fonctions de calcul de résultats et d'affichage dans l'interface.
- **media/** : Dossier contenant les images utilisées dans l'interface utilisateur.

## Utilisation

1. **Ajouter une cuvée** :
   - Cliquez sur "Ajouter une cuvée" pour ouvrir le formulaire.
   - Remplissez les champs requis, puis cliquez sur "Sauvegarder" pour ajouter la cuvée à la liste.

2. **Sauvegarder les diagnostics** :
   - Une fois les diagnostics renseignés pour chaque cuvée, cliquez sur "Sauvegarder les diagnostics" enregistrer les données associées à la cuvée.

2. **Exporter les résultats** :
   - Utilisez le bouton d'exportation pour générer un fichier CSV contenant toutes les informations.

3. **Importer des diagnostics** :
   - Utilisez le bouton d'importation pour charger un fichier CSV contenant des diagnostics précédemment sauvegardés. Les cuvées existantes seront mises à jour, et les nouvelles cuvées seront ajoutées.

## Dépendances

- Aucun framework externe n'est nécessaire. L'application utilise uniquement HTML, CSS, et JavaScript natif.

## Déploiement

Pour déployer cette application, il suffit de placer les fichiers sur un serveur web compatible avec HTML. Aucune configuration spéciale n'est requise.

## Auteur

Développé par le Comité Champagne dans le cadre du déploiement de son guide et plan de prévention et d'éco-conception des emballages.
