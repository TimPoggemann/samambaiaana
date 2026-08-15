export const languages = { pt: 'Português', en: 'English' } as const;
export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'pt';

/** Routes that only exist in Portuguese (legal pages stay in the binding language). */
export const ptOnlyPaths = ['/privacy', '/terms'];

/** Every indexable route, Portuguese-rooted. Paired with its `/en/` twin in the sitemap. */
export const sitePaths = ['/', '/flash', ...ptOnlyPaths];

/**
 * Copy sourced from the design handoff's TRANSLATIONS object (Ana Beatriz /
 * Samambaia Ana landing page), restructured into dot-namespaced keys and
 * merged with the technical strings (a11y, contact-form validation, 404) the
 * handoff prototype never had to define because it had no real form endpoint.
 */
export const ui = {
  pt: {
    'nav.work': 'Trabalhos',
    'nav.flash': 'Flash',
    'nav.about': 'Sobre',
    'nav.book': 'Agendar',

    'a11y.skip': 'Pular para o conteúdo',
    'a11y.home': 'Samambaia Ana – Início',
    'a11y.mainNav': 'Navegação principal',
    'a11y.mobileNav': 'Navegação mobile',
    'a11y.menuDialog': 'Menu de navegação',
    'a11y.openMenu': 'Abrir menu',
    'a11y.closeMenu': 'Fechar menu',
    'a11y.footer': 'Rodapé',
    'a11y.langSwitch': 'Mudar idioma',

    'splash.kicker': 'Tatuagem fine-line & ornamental',

    'hero.headline': 'Magia além da pele',
    'hero.intro': 'Tatuagens ornamentais de traço fino e freehand — botânicas, figurativas, místicas.',
    'hero.button': 'Agendar horário',

    'booking.statusLabel': 'Eurotour · reservas abertas',

    'work.heading': 'Trabalhos selecionados',
    'work.seeMoreInsta': 'Ver mais no Instagram',

    'about.heading': 'Sobre a Samambaia — Ana Beatriz',
    'about.p1': 'Ana Beatriz passou a última década transformando pele em ornamento — traços botânicos, símbolos místicos e mandalas freehand construídas linha a linha.',
    'about.p2': 'Trabalhando em seu estúdio em São Paulo e viajando pela Europa a cada verão, ela desenha cada peça pensando no corpo que vai usá-la.',

    'where.heading': 'Onde me encontrar',
    'where.homeStudio': 'Estúdio próprio',
    'where.spByAppointment': 'São Paulo, Brasil · com hora marcada',
    'where.eurotourHeading': 'Datas do Eurotour 2026',

    'book.label': 'Agendar horário',
    'book.heading': 'Vamos criar algo mágico juntas',
    'book.intro': 'Me conte sua ideia, tamanho e local, e eu retorno o mais rápido possível para pensarmos juntas em algo mágico. Depois de confirmada a data, um sinal é necessário para garantir o horário.',
    'book.flashIntro': 'Encontrou um flash que gostou? Me conte qual desenho, tamanho e local, e eu retorno o mais rápido possível.',
    'book.phName': 'Nome',
    'book.phEmail': 'E-mail',
    'book.optSaoPaulo': 'Cidade e datas — São Paulo (ano todo)',
    'book.phIdea': 'Sua ideia…',
    'book.phReference': 'Envie uma imagem de referência (opcional)',
    'book.sendRequest': 'Enviar pedido',

    'flash.heading': 'Flash',
    'flash.seeAll': 'Ver todos os flashes',
    'flash.subheading': 'Escolha uma peça freehand, desenhada direto na sua pele e pensada para o seu corpo, ou escolha um dos meus flashes abaixo — prontos para tatuar como estão, ou como ponto de partida para a sua própria ideia.',
    'flash.back': '← Início',
    'flash.pageTitle': 'Todos os flashes',
    'flash.pageSub': 'Cada peça aqui está pronta para tatuar como está, ou como ponto de partida para a sua própria ideia.',
    'flash.comingSoon': 'Em breve',
    'flash.statusAvailable': 'Disponível',
    'flash.statusReserved': 'Reservado',
    'flash.statusTaken': 'Indisponível',

    'testimonials.heading': 'Palavras de clientes',

    'faq.heading': 'Perguntas',

    'other.heading': 'Outros trabalhos',
    'other.ceramics': 'Cerâmica',
    'other.prints': 'Gravuras',
    'other.visitShop': 'Ver loja →',

    'footer.location': 'Magia além da pele · São Paulo',
    'footer.instagram': 'Instagram',
    'footer.shop': 'Loja',
    'footer.email': 'E-mail',

    'common.backToTop': 'Voltar ao topo ↑',
    'common.privacy': 'Política de Privacidade',
    'common.terms': 'Termos de Uso',

    'contact.sent': 'Obrigada — seu pedido chegou. Vou responder o quanto antes.',
    'contact.invalid': 'Por favor, preencha nome, e-mail e sua ideia.',
    'contact.error': 'Não foi possível enviar seu pedido. Por favor, escreva diretamente para:',
    'contact.honeypot': 'Deixe este campo em branco',
    'contact.errName': 'Por favor, digite seu nome.',
    'contact.errEmail': 'Por favor, digite seu e-mail.',
    'contact.errEmailInvalid': 'Este endereço parece incompleto — pode conferir?',
    'contact.errIdea': 'Conte um pouco sobre a ideia.',

    'title.home': 'Samambaia Ana',
    'title.flash': 'Todos os flashes',

    'notFound.eyebrow': '404',
    'notFound.title': 'Esta página não existe.',
    'notFound.body': 'O link pode estar desatualizado, ou o endereço foi digitado incorretamente.',
    'notFound.cta': 'Voltar para o início',
  },
  en: {
    'nav.work': 'Work',
    'nav.flash': 'Flash',
    'nav.about': 'About',
    'nav.book': 'Book',

    'a11y.skip': 'Skip to content',
    'a11y.home': 'Samambaia Ana – Home',
    'a11y.mainNav': 'Main navigation',
    'a11y.mobileNav': 'Mobile navigation',
    'a11y.menuDialog': 'Navigation menu',
    'a11y.openMenu': 'Open menu',
    'a11y.closeMenu': 'Close menu',
    'a11y.footer': 'Page footer',
    'a11y.langSwitch': 'Switch language',

    'splash.kicker': 'Fine-line & ornamental tattoo',

    'hero.headline': 'Magic beyond the skin',
    'hero.intro': 'Fine-line and freehand ornamental tattoos — botanical, figurative, mystical.',
    'hero.button': 'Book an appointment',

    'booking.statusLabel': 'Eurotour · bookings open',

    'work.heading': 'Selected work',
    'work.seeMoreInsta': 'See more on Instagram',

    'about.heading': 'About Samambaia — Ana Beatriz',
    'about.p1': 'Ana Beatriz has spent the last decade turning skin into ornament — botanical linework, mystical symbols, and freehand mandalas built one line at a time.',
    'about.p2': 'Working from her São Paulo studio and touring Europe each summer, she designs every piece around the body that will wear it.',

    'where.heading': 'Where to find me',
    'where.homeStudio': 'Home studio',
    'where.spByAppointment': 'São Paulo, Brazil · by appointment',
    'where.eurotourHeading': 'Eurotour 2026 dates',

    'book.label': 'Book an appointment',
    'book.heading': "Let's create something magical together",
    'book.intro': "Reach out with your idea, size, and placement, and I'll get back to you as soon as I can so we can figure out something magical together. Only once the date is confirmed will a deposit be required to secure it.",
    'book.flashIntro': "Found a flash you like? Reach out with the design, your size, and placement, and I'll get back to you as soon as I can.",
    'book.phName': 'Name',
    'book.phEmail': 'Email',
    'book.optSaoPaulo': 'City & dates — São Paulo (year-round)',
    'book.phIdea': 'Your idea…',
    'book.phReference': 'Drop a reference image (optional)',
    'book.sendRequest': 'Send request',

    'flash.heading': 'Flash',
    'flash.seeAll': 'See all flashes',
    'flash.subheading': 'Choose a freehand piece, drawn straight onto your skin and shaped around your body, or pick one of my flash designs below — ready to tattoo as is, or as a starting point for your own idea.',
    'flash.back': '← Home',
    'flash.pageTitle': 'All flash designs',
    'flash.pageSub': 'Every piece here is ready to tattoo as is, or as a starting point for your own idea.',
    'flash.comingSoon': 'Coming soon',
    'flash.statusAvailable': 'Available',
    'flash.statusReserved': 'Reserved',
    'flash.statusTaken': 'Taken',

    'testimonials.heading': 'Kind words',

    'faq.heading': 'Questions',

    'other.heading': 'Other work',
    'other.ceramics': 'Ceramics',
    'other.prints': 'Prints',
    'other.visitShop': 'Visit shop →',

    'footer.location': 'Magic beyond the skin · São Paulo',
    'footer.instagram': 'Instagram',
    'footer.shop': 'Shop',
    'footer.email': 'Email',

    'common.backToTop': 'Back to top ↑',
    'common.privacy': 'Privacy Policy',
    'common.terms': 'Terms of Use',

    'contact.sent': 'Thank you — your request has arrived. I will get back to you as soon as I can.',
    'contact.invalid': 'Please fill in your name, email and your idea.',
    'contact.error': 'Your request could not be sent. Please write to me directly:',
    'contact.honeypot': 'Please leave this field empty',
    'contact.errName': 'Please enter your name.',
    'contact.errEmail': 'Please enter your email address.',
    'contact.errEmailInvalid': 'That address looks incomplete — could you check it?',
    'contact.errIdea': 'Please tell me a bit about the idea.',

    'title.home': 'Samambaia Ana',
    'title.flash': 'All flash designs',

    'notFound.eyebrow': '404',
    'notFound.title': "This page doesn't exist.",
    'notFound.body': 'The link may be out of date, or the address was mistyped.',
    'notFound.cta': 'Back to the homepage',
  },
} as const;

export type UIKey = keyof (typeof ui)['pt'];

/**
 * Choose the English value when it exists and isn't blank, otherwise the
 * Portuguese one. Means a half-translated CMS never shows an empty page.
 */
export function localized<T>(lang: Lang, pt: T, en?: T | null): T {
  if (lang !== 'en' || en == null) return pt;
  if (typeof en === 'string' && en.trim() === '') return pt;
  if (Array.isArray(en) && en.length === 0) return pt;
  return en;
}

/** Read the active locale off the URL. Anything not under /en/ is Portuguese. */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : 'pt';
}

/** Translator bound to a locale, falling back to Portuguese if a key is ever missing. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

/** Turn a Portuguese-rooted path into the equivalent path for `lang`. */
export function localizePath(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  // Legal pages exist only in Portuguese, so never prefix them.
  if (ptOnlyPaths.includes(path)) return path;
  return path === '/' ? '/en/' : `/en${path}`;
}

/** Strip the locale prefix, giving the canonical Portuguese-rooted path. */
export function stripLangPrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
}

/**
 * Pick the best locale from an Accept-Language header.
 * Returns Portuguese unless English scores strictly higher.
 */
export function preferredLangFrom(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return defaultLang;
  let pt = 0;
  let en = 0;
  for (const part of acceptLanguage.split(',')) {
    const [tag, ...params] = part.trim().split(';');
    const qParam = params.find((p) => p.trim().startsWith('q='));
    const q = qParam ? parseFloat(qParam.split('=')[1]) : 1;
    if (Number.isNaN(q)) continue;
    const base = tag.trim().toLowerCase().split('-')[0];
    if (base === 'pt' && q > pt) pt = q;
    if (base === 'en' && q > en) en = q;
  }
  return en > pt ? 'en' : defaultLang;
}
