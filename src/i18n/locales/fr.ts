import { TranslationDictionary } from '../types';
import { en } from './en';

export const fr: TranslationDictionary = {
  ...en,
  common: {
    ...en.common,
    appName: 'JeevanDarpan',
    appTagline: 'Autoréflexion védique et compagnon cosmique',
    privateEdition: 'Édition familiale privée',
    start: 'Commencer',
    goBack: 'Retour',
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    search: 'Rechercher',
    loading: 'Chargement...',
    error: 'Une erreur inattendue est survenue.',
    retry: 'Réessayer',
    verified: 'Vérifié déterministement',
    notAvailable: 'Non disponible',
    success: 'Terminé avec succès',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    active: 'Actif',
    language: 'Langue',
    settings: 'Paramètres',
    yes: 'Oui',
    no: 'Non',
    name: 'Nom',
    next: 'Suivant',
    previous: 'Précédent',
    downloadPdf: 'Télécharger PDF',
    share: 'Partager',
    today: 'Aujourd\'hui',
    tomorrow: 'Demain',
    why: 'Pourquoi ?',
    select: 'Sélectionner'
  }
};
