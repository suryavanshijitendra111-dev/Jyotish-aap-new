export interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  isLive: boolean;
  action: () => void;
}

export function getModules(
  t: (key: string) => string,
  navigate: (view: string) => void,
  showToast: (msg: string) => void,
  setShowLangModal: (open: boolean) => void
): ModuleItem[] {
  return [
    {
      id: 'kundli',
      title: t('modules.kundli.title'),
      subtitle: t('modules.kundli.subtitle'),
      desc: t('modules.kundli.desc'),
      isLive: true,
      action: () => navigate('kundli_intro')
    },
    {
      id: 'kp',
      title: t('modules.kp.title'),
      subtitle: t('modules.kp.subtitle'),
      desc: t('modules.kp.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_scroll_to', 'kp'); } catch {}
        navigate('kundli_shell');
      }
    },
    {
      id: 'pragya',
      title: t('modules.pragya.title'),
      subtitle: t('modules.pragya.subtitle'),
      desc: t('modules.pragya.desc'),
      isLive: true,
      action: () => navigate('jeevan_pragya')
    },
    {
      id: 'dasha',
      title: t('modules.dasha.title'),
      subtitle: t('modules.dasha.subtitle'),
      desc: t('modules.dasha.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_scroll_to', 'dasha'); } catch {}
        navigate('kundli_shell');
      }
    },
    {
      id: 'gochar',
      title: t('modules.gochar.title'),
      subtitle: t('modules.gochar.subtitle'),
      desc: t('modules.gochar.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_scroll_to', 'transit'); } catch {}
        navigate('kundli_shell');
      }
    },
    {
      id: 'varga',
      title: t('modules.varga.title'),
      subtitle: t('modules.varga.subtitle'),
      desc: t('modules.varga.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_scroll_to', 'varga'); } catch {}
        navigate('kundli_shell');
      }
    },
    {
      id: 'numerology',
      title: t('modules.numerology.title'),
      subtitle: t('modules.numerology.subtitle'),
      desc: t('modules.numerology.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_numerology_tab', 'CORE'); } catch {}
        navigate('numerology');
      }
    },
    {
      id: 'loshu',
      title: t('modules.loshu.title'),
      subtitle: t('modules.loshu.subtitle'),
      desc: t('modules.loshu.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_numerology_tab', 'LOSHU'); } catch {}
        navigate('numerology');
      }
    },
    {
      id: 'prashna',
      title: t('modules.prashna.title'),
      subtitle: t('modules.prashna.subtitle'),
      desc: t('modules.prashna.desc'),
      isLive: true,
      action: () => navigate('prashna_kundli')
    },
    {
      id: 'aiJyotish',
      title: t('modules.aiJyotish.title'),
      subtitle: t('modules.aiJyotish.subtitle'),
      desc: t('modules.aiJyotish.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_intel_tab', 'AI'); } catch {}
        navigate('intelligence_dashboard');
      }
    },
    {
      id: 'lifeQuestions',
      title: t('modules.lifeQuestions.title'),
      subtitle: t('modules.lifeQuestions.subtitle'),
      desc: t('modules.lifeQuestions.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_intel_tab', 'QUESTIONS'); } catch {}
        navigate('intelligence_dashboard');
      }
    },
    {
      id: 'dailyCompanion',
      title: t('modules.dailyCompanion.title'),
      subtitle: t('modules.dailyCompanion.subtitle'),
      desc: t('modules.dailyCompanion.desc'),
      isLive: true,
      action: () => navigate('daily_companion')
    },
    {
      id: 'pratahSanskar',
      title: t('modules.pratahSanskar.title'),
      subtitle: t('modules.pratahSanskar.subtitle'),
      desc: t('modules.pratahSanskar.desc'),
      isLive: true,
      action: () => navigate('pratah_sanskar')
    },
    {
      id: 'muhurat',
      title: t('modules.muhurat.title'),
      subtitle: t('modules.muhurat.subtitle'),
      desc: t('modules.muhurat.desc'),
      isLive: true,
      action: () => navigate('muhurat')
    },
    {
      id: 'doshRemedies',
      title: t('modules.doshRemedies.title'),
      subtitle: t('modules.doshRemedies.subtitle'),
      desc: t('modules.doshRemedies.desc'),
      isLive: true,
      action: () => navigate('dosh_remedies')
    },
    {
      id: 'lalKitab',
      title: t('modules.lalKitab.title'),
      subtitle: t('modules.lalKitab.subtitle'),
      desc: t('modules.lalKitab.desc'),
      isLive: true,
      action: () => {
        try { sessionStorage.setItem('jeevandarpan_scroll_to', 'lalkitab'); } catch {}
        navigate('kundli_shell');
      }
    },
    {
      id: 'reports',
      title: t('modules.reports.title'),
      subtitle: t('modules.reports.subtitle'),
      desc: t('modules.reports.desc'),
      isLive: true,
      action: () => navigate('reports')
    },
    {
      id: 'family',
      title: t('modules.family.title'),
      subtitle: t('modules.family.subtitle'),
      desc: t('modules.family.desc'),
      isLive: true,
      action: () => navigate('profile')
    },
    {
      id: 'lifeJournal',
      title: t('modules.lifeJournal.title'),
      subtitle: t('modules.lifeJournal.subtitle'),
      desc: t('modules.lifeJournal.desc'),
      isLive: true,
      action: () => navigate('daily_report_card')
    },
    {
      id: 'meditation',
      title: t('modules.meditation.title'),
      subtitle: t('modules.meditation.subtitle'),
      desc: t('modules.meditation.desc'),
      isLive: true,
      action: () => navigate('meditation')
    },
    {
      id: 'yoga',
      title: t('modules.yoga.title'),
      subtitle: t('modules.yoga.subtitle'),
      desc: t('modules.yoga.desc'),
      isLive: true,
      action: () => navigate('yoga')
    },
    {
      id: 'mantraJaap',
      title: t('modules.mantraJaap.title'),
      subtitle: t('modules.mantraJaap.subtitle'),
      desc: t('modules.mantraJaap.desc'),
      isLive: false,
      action: () => showToast(t('common.moduleComingSoon'))
    },
    {
      id: 'puja3d',
      title: t('modules.puja3d.title'),
      subtitle: t('modules.puja3d.subtitle'),
      desc: t('modules.puja3d.desc'),
      isLive: false,
      action: () => showToast(t('common.moduleComingSoon'))
    },
    {
      id: 'templeExplorer',
      title: t('modules.templeExplorer.title'),
      subtitle: t('modules.templeExplorer.subtitle'),
      desc: t('modules.templeExplorer.desc'),
      isLive: false,
      action: () => showToast(t('common.moduleComingSoon'))
    },
    {
      id: 'templeTravel',
      title: t('modules.templeTravel.title'),
      subtitle: t('modules.templeTravel.subtitle'),
      desc: t('modules.templeTravel.desc'),
      isLive: false,
      action: () => showToast(t('common.moduleComingSoon'))
    },
    {
      id: 'spiritualStore',
      title: t('modules.spiritualStore.title'),
      subtitle: t('modules.spiritualStore.subtitle'),
      desc: t('modules.spiritualStore.desc'),
      isLive: false,
      action: () => showToast(t('common.moduleComingSoon'))
    },
    {
      id: 'settings',
      title: t('modules.settings.title'),
      subtitle: t('modules.settings.subtitle'),
      desc: t('modules.settings.desc'),
      isLive: true,
      action: () => setShowLangModal(true)
    }
  ];
}
