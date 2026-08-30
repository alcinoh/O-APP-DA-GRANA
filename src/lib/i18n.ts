import { LanguageId, LanguageConfig, ThemeId, ThemeConfig } from '../types';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { id: 'pt', name: 'Português (Brasil)', nativeName: 'Português', flag: '🇧🇷', code: 'pt-BR' },
  { id: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', code: 'en-US' },
  { id: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', code: 'es-ES' },
  { id: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', code: 'fr-FR' },
  { id: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', code: 'it-IT' },
];

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Escuro Clássico',
    category: 'dark',
    accentColor: '#10b981',
    secondaryColor: '#0ea5e9',
    bgPreview: 'from-slate-900 to-slate-950',
    tag: 'Padrão',
    description: 'Contraste suave em tons de ardósia com acentos em esmeralda vibrante.'
  },
  {
    id: 'light',
    name: 'Claro Clean',
    category: 'light',
    accentColor: '#059669',
    secondaryColor: '#0284c7',
    bgPreview: 'from-slate-50 to-slate-200',
    tag: 'Minimalista',
    description: 'Interface clara e ultra limpa com máxima legibilidade para luz do dia.'
  },
  {
    id: 'emerald',
    name: 'Esmeralda Private',
    category: 'luxury',
    accentColor: '#10b981',
    secondaryColor: '#fbbf24',
    bgPreview: 'from-emerald-950 to-[#021810]',
    tag: 'Private Banking',
    description: 'Verde esmeralda profundo inspirado em finanças de alto padrão e ouro.'
  },
  {
    id: 'safira',
    name: 'Safira Oceano',
    category: 'neon',
    accentColor: '#0ea5e9',
    secondaryColor: '#38bdf8',
    bgPreview: 'from-sky-950 to-[#030d22]',
    tag: 'Navy Tech',
    description: 'Azul marítimo profundo com destaques em ciano elétrico e safira.'
  },
  {
    id: 'nebula',
    name: 'Nebula Cyber',
    category: 'cyber',
    accentColor: '#a855f7',
    secondaryColor: '#ec4899',
    bgPreview: 'from-purple-950 to-[#0d051a]',
    tag: 'Cyberpunk',
    description: 'Violeta cósmico e ametista neon para uma estética futurista refinada.'
  },
  {
    id: 'sunset',
    name: 'Ouro & Âmbar',
    category: 'luxury',
    accentColor: '#f59e0b',
    secondaryColor: '#fb923c',
    bgPreview: 'from-amber-950 to-[#180f08]',
    tag: 'Executivo',
    description: 'Tons de âmbar quente, bronze e carvão com toque de lingote de ouro.'
  },
  {
    id: 'crimson',
    name: 'Carmim Titanium',
    category: 'luxury',
    accentColor: '#f43f5e',
    secondaryColor: '#fda4af',
    bgPreview: 'from-rose-950 to-[#16060c]',
    tag: 'Alta Performance',
    description: 'Rubi carmim e titânio escuro para tomada de decisões com pulso firme.'
  },
];

export const translations = {
  pt: {
    // Nav
    nav_dashboard: 'Início',
    nav_transactions: 'Lançamentos',
    nav_cart: 'Carrinho',
    nav_analytics: 'Análise',
    nav_chat: 'Assessor IA',
    nav_strategies: 'Estratégias',
    nav_options: 'Opções',
    
    // Header & Global
    app_name: 'ASSESSORIA',
    app_subtitle: 'FINANCEIRA PRO',
    guest_mode: 'Modo Visitante',
    logout_btn: 'Sair da Conta',
    install_btn: 'Instalar Aplicativo (PWA)',
    install_quick: 'Instalar',
    bio_active: 'Biometria Ativa',
    bio_title: 'Biometria / PIN',
    bio_enable: 'Ativar Biometria',
    bio_lock_now: 'Bloquear App Agora',
    bio_registering: 'Registrando digital...',
    version_title: 'Ver novidades e informações da versão',
    
    // Options / Settings
    settings_title: 'Menu de Opções & Configurações',
    settings_subtitle: 'Personalize a linguagem, temas visuais de layout e comportamento das micro-animações.',
    settings_tabs_general: 'Geral & Idioma',
    settings_tabs_themes: 'Temas de Layout',
    settings_tabs_animations: 'Micro-Animações',
    settings_tabs_security: 'Segurança & Biometria',
    
    // Language Section
    lang_section_title: 'Idioma do Sistema',
    lang_section_desc: 'Escolha a língua principal para toda a navegação e relatórios.',
    lang_current: 'Idioma Atual:',
    
    // Theme Section
    theme_section_title: 'Temas Visuais de Layout',
    theme_section_desc: 'Mais de 7 estilos concebidos com paletas harmoniosas e alto contraste.',
    theme_current: 'Tema Selecionado:',
    theme_active_badge: 'Em Uso',
    theme_apply_btn: 'Aplicar Tema',
    
    // Animations Section
    anim_section_title: 'Micro-Interações & Transições',
    anim_section_desc: 'Experimente 3 acionamentos interativos de botões calibrados para máxima fluidez sem poluição visual.',
    anim_switch_title: 'Animações de Interface Ativas',
    anim_switch_desc: 'Transições suaves entre telas, cards expansíveis e feedbacks táteis.',
    anim_test_btn1: '1. Pulso & Ripple Suave',
    anim_test_btn1_desc: 'Efeito orgânico de pressão com onda de preenchimento suave.',
    anim_test_btn2: '2. Glow Magnético / Spring',
    anim_test_btn2_desc: 'Glow perimetral dinâmico e resposta elástica com física de mola.',
    anim_test_btn3: '3. Morph de Sucesso com Check',
    anim_test_btn3_desc: 'Transformação fluida para confirmação de transação sem saltos.',
    
    // Security Section
    sec_section_title: 'Segurança e Bloqueio Instantâneo',
    sec_section_desc: 'Proteja seus dados financeiros contra acessos não autorizados.',
    sec_webauthn_status: 'Status do Sensor WebAuthn:',
    sec_webauthn_enabled: 'Biometria Habilitada',
    sec_webauthn_disabled: 'Biometria Desativada',
    sec_lock_action: 'Testar Bloqueio Imediato',
    sec_lock_action_desc: 'Bloqueia o app instantaneamente exigindo sua digital, Face ID ou PIN.',

    // Stats & Dashboard
    dash_balance: 'Saldo Atual',
    dash_income: 'Receitas Confirmadas',
    dash_expense: 'Despesas Pagas',
    dash_pending: 'Pendências a Compensar',
    dash_statement_btn: 'Extrato Bancário',
    dash_chat_card_title: 'Dúvidas Financeiras?',
    dash_chat_card_desc: 'Seu Assessor IA está pronto para analisar seus gastos e sugerir metas de economia.',
    dash_chat_card_btn: 'Conversar com Assessor IA',
    dash_pending_box_title: 'Lançamentos Pendentes',
    dash_recent_box_title: 'Histórico Recente',
    dash_view_all: 'Ver todos',
    dash_confirm_tx: 'Confirmar',
    dash_no_pending: 'Nenhum lançamento pendente no momento.',
    
    // Feedback
    theme_changed_toast: 'Tema alterado para',
    lang_changed_toast: 'Idioma atualizado com sucesso!',
    saved_badge: 'Salvo automaticamente',
  },

  en: {
    // Nav
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Transactions',
    nav_cart: 'Cart',
    nav_analytics: 'Analytics',
    nav_chat: 'AI Advisor',
    nav_strategies: 'Strategies',
    nav_options: 'Options',
    
    // Header & Global
    app_name: 'ASSESSORIA',
    app_subtitle: 'FINANCIAL PRO',
    guest_mode: 'Guest Mode',
    logout_btn: 'Sign Out',
    install_btn: 'Install App (PWA)',
    install_quick: 'Install',
    bio_active: 'Biometrics Active',
    bio_title: 'Biometrics / PIN',
    bio_enable: 'Enable Biometrics',
    bio_lock_now: 'Lock App Now',
    bio_registering: 'Registering fingerprint...',
    version_title: 'View release notes and version info',
    
    // Options / Settings
    settings_title: 'Options & Settings Menu',
    settings_subtitle: 'Customize language, visual layout themes, and micro-animation behaviors.',
    settings_tabs_general: 'General & Language',
    settings_tabs_themes: 'Layout Themes',
    settings_tabs_animations: 'Micro-Animations',
    settings_tabs_security: 'Security & Biometrics',
    
    // Language Section
    lang_section_title: 'System Language',
    lang_section_desc: 'Select the primary language for navigation, reports, and calculations.',
    lang_current: 'Current Language:',
    
    // Theme Section
    theme_section_title: 'Visual Layout Themes',
    theme_section_desc: '7 curated themes designed with harmonious palettes and pristine contrast.',
    theme_current: 'Active Theme:',
    theme_active_badge: 'In Use',
    theme_apply_btn: 'Apply Theme',
    
    // Animations Section
    anim_section_title: 'Micro-Interactions & Transitions',
    anim_section_desc: 'Experience 3 interactive button triggers calibrated for peak fluidity without visual clutter.',
    anim_switch_title: 'Active UI Animations',
    anim_switch_desc: 'Smooth screen transitions, expandable stat cards, and tactile button feedback.',
    anim_test_btn1: '1. Soft Pulse & Ripple',
    anim_test_btn1_desc: 'Organic pressure effect with a gentle fluid fill wave.',
    anim_test_btn2: '2. Magnetic Glow / Spring',
    anim_test_btn2_desc: 'Perimeter dynamic glow and elastic physics spring response.',
    anim_test_btn3: '3. Smooth Success Morph',
    anim_test_btn3_desc: 'Seamless icon morphing for transaction confirmation.',
    
    // Security Section
    sec_section_title: 'Security & Instant Lock',
    sec_section_desc: 'Protect your financial records from unauthorized access.',
    sec_webauthn_status: 'WebAuthn Sensor Status:',
    sec_webauthn_enabled: 'Biometrics Enabled',
    sec_webauthn_disabled: 'Biometrics Disabled',
    sec_lock_action: 'Test Instant Lock',
    sec_lock_action_desc: 'Instantly locks the screen requiring your fingerprint, Face ID, or PIN.',

    // Stats & Dashboard
    dash_balance: 'Current Balance',
    dash_income: 'Confirmed Income',
    dash_expense: 'Settled Expenses',
    dash_pending: 'Pending Clearance',
    dash_statement_btn: 'Bank Statement',
    dash_chat_card_title: 'Financial Inquiries?',
    dash_chat_card_desc: 'Your AI Advisor is ready to analyze spending patterns and suggest savings goals.',
    dash_chat_card_btn: 'Chat with AI Advisor',
    dash_pending_box_title: 'Pending Transactions',
    dash_recent_box_title: 'Recent Activity',
    dash_view_all: 'View all',
    dash_confirm_tx: 'Confirm',
    dash_no_pending: 'No pending transactions found.',
    
    // Feedback
    theme_changed_toast: 'Theme changed to',
    lang_changed_toast: 'Language updated successfully!',
    saved_badge: 'Automatically saved',
  },

  es: {
    // Nav
    nav_dashboard: 'Inicio',
    nav_transactions: 'Movimientos',
    nav_cart: 'Carrito',
    nav_analytics: 'Análisis',
    nav_chat: 'Asesor IA',
    nav_strategies: 'Estrategias',
    nav_options: 'Opciones',
    
    // Header & Global
    app_name: 'ASSESSORIA',
    app_subtitle: 'FINANZAS PRO',
    guest_mode: 'Modo Invitado',
    logout_btn: 'Cerrar Sesión',
    install_btn: 'Instalar Aplicación (PWA)',
    install_quick: 'Instalar',
    bio_active: 'Biometría Activa',
    bio_title: 'Biometría / PIN',
    bio_enable: 'Activar Biometría',
    bio_lock_now: 'Bloquear App Ahora',
    bio_registering: 'Registrando huella...',
    version_title: 'Ver novedades e información de versión',
    
    // Options / Settings
    settings_title: 'Menú de Opciones y Ajustes',
    settings_subtitle: 'Personaliza el idioma, los temas visuales de diseño y las micro-animaciones.',
    settings_tabs_general: 'General e Idioma',
    settings_tabs_themes: 'Temas de Diseño',
    settings_tabs_animations: 'Micro-Animaciones',
    settings_tabs_security: 'Seguridad y Biometría',
    
    // Language Section
    lang_section_title: 'Idioma del Sistema',
    lang_section_desc: 'Selecciona el idioma principal para navegación y reportes.',
    lang_current: 'Idioma Actual:',
    
    // Theme Section
    theme_section_title: 'Temas Visuales de Diseño',
    theme_section_desc: '7 estilos con paletas equilibradas y máximo contraste.',
    theme_current: 'Tema Seleccionado:',
    theme_active_badge: 'En Uso',
    theme_apply_btn: 'Aplicar Tema',
    
    // Animations Section
    anim_section_title: 'Micro-Interacciones y Transiciones',
    anim_section_desc: 'Prueba 3 disparadores interactivos de botones para máxima fluidez.',
    anim_switch_title: 'Animaciones de Interfaz Activas',
    anim_switch_desc: 'Transiciones suaves entre pantallas y respuesta táctil sutil.',
    anim_test_btn1: '1. Pulso y Onda Suave',
    anim_test_btn1_desc: 'Efecto de presión orgánica con relleno fluido.',
    anim_test_btn2: '2. Brillo Magnético / Resorte',
    anim_test_btn2_desc: 'Brillo perimetral dinámico con física elástica.',
    anim_test_btn3: '3. Transformación de Éxito',
    anim_test_btn3_desc: 'Animación fluida de confirmación sin saltos bruscos.',
    
    // Security Section
    sec_section_title: 'Seguridad y Bloqueo Inmediato',
    sec_section_desc: 'Protege tus finanzas contra accesos no autorizados.',
    sec_webauthn_status: 'Estado de WebAuthn:',
    sec_webauthn_enabled: 'Biometría Habilitada',
    sec_webauthn_disabled: 'Biometria Desactivada',
    sec_lock_action: 'Probar Bloqueo Inmediato',
    sec_lock_action_desc: 'Bloquea la pantalla solicitando tu huella o PIN.',

    // Stats & Dashboard
    dash_balance: 'Saldo Actual',
    dash_income: 'Ingresos Confirmados',
    dash_expense: 'Gastos Pagados',
    dash_pending: 'Pendientes por Compensar',
    dash_statement_btn: 'Extracto Bancario',
    dash_chat_card_title: '¿Consultas Financieras?',
    dash_chat_card_desc: 'Tu Asesor IA está listo para sugerir metas y evaluar tus gastos.',
    dash_chat_card_btn: 'Hablar con Asesor IA',
    dash_pending_box_title: 'Movimientos Pendientes',
    dash_recent_box_title: 'Actividad Reciente',
    dash_view_all: 'Ver todos',
    dash_confirm_tx: 'Confirmar',
    dash_no_pending: 'No hay movimientos pendientes.',
    
    // Feedback
    theme_changed_toast: 'Tema cambiado a',
    lang_changed_toast: '¡Idioma actualizado correctamente!',
    saved_badge: 'Guardado automáticamente',
  },

  fr: {
    // Nav
    nav_dashboard: 'Tableau',
    nav_transactions: 'Transactions',
    nav_cart: 'Panier',
    nav_analytics: 'Analyses',
    nav_chat: 'Conseiller IA',
    nav_strategies: 'Stratégies',
    nav_options: 'Options',
    
    // Header & Global
    app_name: 'ASSESSORIA',
    app_subtitle: 'FINANCE PRO',
    guest_mode: 'Mode Invité',
    logout_btn: 'Déconnexion',
    install_btn: 'Installer l’App (PWA)',
    install_quick: 'Installer',
    bio_active: 'Biométrie Active',
    bio_title: 'Biométrie / PIN',
    bio_enable: 'Activer la Biométrie',
    bio_lock_now: 'Verrouiller l’App',
    bio_registering: 'Enregistrement de l’empreinte...',
    version_title: 'Voir les notes de version',
    
    // Options / Settings
    settings_title: 'Menu Options & Paramètres',
    settings_subtitle: 'Personnalisez la langue, les thèmes visuels et les micro-animations.',
    settings_tabs_general: 'Général & Langue',
    settings_tabs_themes: 'Thèmes Visuels',
    settings_tabs_animations: 'Micro-Animations',
    settings_tabs_security: 'Sécurité & Biométrie',
    
    // Language Section
    lang_section_title: 'Langue du Système',
    lang_section_desc: 'Choisissez la langue principale pour les rapports et la navigation.',
    lang_current: 'Langue Actuelle:',
    
    // Theme Section
    theme_section_title: 'Thèmes de Disposition',
    theme_section_desc: '7 palettes soignées pour un contraste et une lisibilité parfaits.',
    theme_current: 'Thème Sélectionné:',
    theme_active_badge: 'Actif',
    theme_apply_btn: 'Appliquer le Thème',
    
    // Animations Section
    anim_section_title: 'Micro-Interactions & Transitions',
    anim_section_desc: 'Testez 3 déclencheurs de boutons interactifs conçus sans surcharge visuelle.',
    anim_switch_title: 'Animations Actives',
    anim_switch_desc: 'Transitions fluides entre les vues et retour tactile dynamique.',
    anim_test_btn1: '1. Impulsion & Vague Douce',
    anim_test_btn1_desc: 'Effet de pression organique avec remplissage progressif.',
    anim_test_btn2: '2. Lueur Magnétique / Ressort',
    anim_test_btn2_desc: 'Éclat périphérique dynamique et retour élastique.',
    anim_test_btn3: '3. Morph de Confirmation',
    anim_test_btn3_desc: 'Transformation fluide d’icône pour valider l’opération.',
    
    // Security Section
    sec_section_title: 'Sécurité & Verrouillage',
    sec_section_desc: 'Protégez vos informations financières contre tout accès non autorisé.',
    sec_webauthn_status: 'État WebAuthn:',
    sec_webauthn_enabled: 'Biométrie Activée',
    sec_webauthn_disabled: 'Biométrie Désactivée',
    sec_lock_action: 'Verrouiller Maintenant',
    sec_lock_action_desc: 'Verrouille immédiatement l’écran avec TouchID / FaceID.',

    // Stats & Dashboard
    dash_balance: 'Solde Actuel',
    dash_income: 'Revenus Confirmés',
    dash_expense: 'Dépenses Réglées',
    dash_pending: 'En Attente',
    dash_statement_btn: 'Relevé Bancaire',
    dash_chat_card_title: 'Questions Financières ?',
    dash_chat_card_desc: 'Votre conseiller IA est prêt à analyser vos postes de dépenses.',
    dash_chat_card_btn: 'Discuter avec l’IA',
    dash_pending_box_title: 'Opérations en Attente',
    dash_recent_box_title: 'Activité Récente',
    dash_view_all: 'Voir tout',
    dash_confirm_tx: 'Confirmer',
    dash_no_pending: 'Aucune opération en attente.',
    
    // Feedback
    theme_changed_toast: 'Thème changé pour',
    lang_changed_toast: 'Langue mise à jour avec succès !',
    saved_badge: 'Enregistré automatiquement',
  },

  it: {
    // Nav
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Movimenti',
    nav_cart: 'Carrello',
    nav_analytics: 'Analisi',
    nav_chat: 'Consulente IA',
    nav_strategies: 'Strategie',
    nav_options: 'Opzioni',
    
    // Header & Global
    app_name: 'ASSESSORIA',
    app_subtitle: 'FINANZA PRO',
    guest_mode: 'Modalità Ospite',
    logout_btn: 'Disconnetti',
    install_btn: 'Installa App (PWA)',
    install_quick: 'Installa',
    bio_active: 'Biometria Attiva',
    bio_title: 'Biometria / PIN',
    bio_enable: 'Attiva Biometria',
    bio_lock_now: 'Blocca App Adesso',
    bio_registering: 'Registrazione impronta...',
    version_title: 'Visualizza note di rilascio',
    
    // Options / Settings
    settings_title: 'Menu Opzioni & Impostazioni',
    settings_subtitle: 'Personalizza la lingua, i temi del layout visivo e le micro-animazioni.',
    settings_tabs_general: 'Generale & Lingua',
    settings_tabs_themes: 'Temi di Layout',
    settings_tabs_animations: 'Micro-Animazioni',
    settings_tabs_security: 'Sicurezza & Biometria',
    
    // Language Section
    lang_section_title: 'Lingua di Sistema',
    lang_section_desc: 'Seleziona la lingua principale per la navigazione e i report.',
    lang_current: 'Lingua Attuale:',
    
    // Theme Section
    theme_section_title: 'Temi Visivi del Layout',
    theme_section_desc: '7 stili curati con palette equilibrate e contrasto elevato.',
    theme_current: 'Tema Selezionato:',
    theme_active_badge: 'In Uso',
    theme_apply_btn: 'Applica Tema',
    
    // Animations Section
    anim_section_title: 'Micro-Interazioni & Transizioni',
    anim_section_desc: 'Sperimenta 3 azionamenti interattivi di pulsanti senza sovraccarico visivo.',
    anim_switch_title: 'Animazioni Interfaccia Attive',
    anim_switch_desc: 'Transizioni fluide tra schermate e feedback tattile bilanciato.',
    anim_test_btn1: '1. Impulso & Onda Fluida',
    anim_test_btn1_desc: 'Effetto di pressione organica con riempimento fluido.',
    anim_test_btn2: '2. Bagliore Magnetico / Molla',
    anim_test_btn2_desc: 'Luminosità dinamica e risposta elastica con fisica a molla.',
    anim_test_btn3: '3. Morph di Successo',
    anim_test_btn3_desc: 'Trasformazione fluida dell’icona per la conferma immediata.',
    
    // Security Section
    sec_section_title: 'Sicurezza & Blocco Immediato',
    sec_section_desc: 'Proteggi i tuoi dati finanziari da accessi non autorizzati.',
    sec_webauthn_status: 'Stato Sensore WebAuthn:',
    sec_webauthn_enabled: 'Biometria Abilitata',
    sec_webauthn_disabled: 'Biometria Disattivata',
    sec_lock_action: 'Blocca App Ora',
    sec_lock_action_desc: 'Blocca istantaneamente lo schermo richiedendo l’impronta o il PIN.',

    // Stats & Dashboard
    dash_balance: 'Saldo Attuale',
    dash_income: 'Entrate Confermate',
    dash_expense: 'Spese Pagate',
    dash_pending: 'In Sospeso',
    dash_statement_btn: 'Estratto Conto',
    dash_chat_card_title: 'Domande Finanziarie?',
    dash_chat_card_desc: 'Il tuo Consulente IA è pronto ad analizzare le spese e suggerire obiettivi.',
    dash_chat_card_btn: 'Parla con il Consulente IA',
    dash_pending_box_title: 'Movimenti in Sospeso',
    dash_recent_box_title: 'Attività Recente',
    dash_view_all: 'Vedi tutti',
    dash_confirm_tx: 'Conferma',
    dash_no_pending: 'Nessun movimento in sospeso.',
    
    // Feedback
    theme_changed_toast: 'Tema cambiato in',
    lang_changed_toast: 'Lingua aggiornata con successo!',
    saved_badge: 'Salvato automaticamente',
  },
};

export type TranslationKey = keyof typeof translations.pt;
