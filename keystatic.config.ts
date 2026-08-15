import { config, collection, singleton, fields } from '@keystatic/core';
import { SEO_DEFAULTS, type SeoPage } from './src/seo/defaults';

const ALT_TEXT_HELP =
  'Descrição curta da imagem (lida por leitores de tela para pessoas com deficiência visual e ajuda os buscadores a entender a imagem)';

const META_DESCRIPTION_HELP =
  'Texto curto que aparece no Google como prévia abaixo do título nos resultados de busca (meta descrição). Recomendação: 120–160 caracteres.';

const EN_HELP =
  'Versão em inglês. Deixe em branco para usar o texto em português automaticamente.';

const OG_TITLE_HELP = 'Título ao compartilhar no WhatsApp, Instagram, Facebook etc. Deixe em branco para usar o meta título (SEO).';
const OG_DESCRIPTION_HELP = 'Descrição ao compartilhar. Deixe em branco para usar a meta descrição (SEO).';
const OG_IMAGE_HELP = 'Imagem ao compartilhar. Recomendação: 1200×630px, paisagem. Deixe em branco para usar a imagem padrão do site.';
const NOINDEX_HELP = 'Remover a página da busca do Google e do sitemap, sem excluí-la.';

function enField(label: string, multiline = false) {
  return fields.text({ label: `${label} (EN)`, description: EN_HELP, multiline });
}

const META_TITLE_HELP =
  'Título do resultado no Google e texto na aba do navegador. Recomendação: 50–60 caracteres. "Samambaia Ana" é adicionado automaticamente, a menos que o título já contenha o nome.';

function metaDescriptionField(defaultValue: string) {
  return fields.text({
    label: 'Meta Descrição (SEO)',
    description: META_DESCRIPTION_HELP,
    multiline: true,
    validation: { length: { max: 160 } },
    defaultValue,
  });
}

function metaTitleField(defaultValue: string) {
  return fields.text({
    label: 'Meta Título (SEO)',
    description: META_TITLE_HELP,
    validation: { length: { max: 70 } },
    defaultValue,
  });
}

function seoPageFields(page: SeoPage, pageLabel: string) {
  return fields.object(
    {
      title: metaTitleField(SEO_DEFAULTS[`${page}Title`]),
      titleEn: enField('Meta Título'),
      description: metaDescriptionField(SEO_DEFAULTS[`${page}Description`]),
      descriptionEn: enField('Meta Descrição', true),
      ogTitle: fields.text({ label: 'Título OG', description: OG_TITLE_HELP }),
      ogTitleEn: enField('Título OG'),
      ogDescription: fields.text({ label: 'Descrição OG', description: OG_DESCRIPTION_HELP, multiline: true }),
      ogDescriptionEn: enField('Descrição OG', true),
      ogImage: fields.image({ label: 'Imagem OG', description: OG_IMAGE_HELP, directory: 'public/og', publicPath: '/og/' }),
      noindex: fields.checkbox({ label: 'Excluir da busca/sitemap', description: NOINDEX_HELP, defaultValue: false }),
    },
    { label: pageLabel }
  );
}

export default config({
  storage: { kind: 'cloud' },
  cloud: { project: 'samambaiaana/samambaiaana' },

  singletons: {
    hero: singleton({
      label: 'Hero',
      path: 'src/content/singletons/hero',
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Título', defaultValue: 'Magia além da pele' }),
        headingEn: enField('Título'),
        intro: fields.text({ label: 'Subtítulo', multiline: true }),
        introEn: enField('Subtítulo', true),
        button: fields.text({ label: 'Texto do Botão', defaultValue: 'Agendar horário' }),
        buttonEn: enField('Texto do Botão'),
        mediaType: fields.select({
          label: 'Tipo de Mídia de Fundo',
          options: [
            { label: 'Vídeo', value: 'video' },
            { label: 'Imagem', value: 'image' },
          ],
          defaultValue: 'video',
        }),
        video: fields.file({ label: 'Vídeo de Fundo (se Tipo = Vídeo)', directory: 'public/videos', publicPath: '/videos/' }),
        image: fields.image({ label: 'Imagem de Fundo (se Tipo = Imagem)', directory: 'public/images', publicPath: '/images/' }),
        imageAlt: fields.text({ label: 'Alt Text da Imagem', description: ALT_TEXT_HELP }),
        imageAltEn: enField('Alt Text da Imagem'),
      },
    }),

    about: singleton({
      label: 'Sobre',
      path: 'src/content/singletons/about',
      format: { data: 'json' },
      schema: {
        bioP1: fields.text({ label: 'Bio — Parágrafo 1', multiline: true }),
        bioP1En: enField('Bio — Parágrafo 1', true),
        bioP2: fields.text({ label: 'Bio — Parágrafo 2', multiline: true }),
        bioP2En: enField('Bio — Parágrafo 2', true),
        portrait: fields.image({ label: 'Retrato', directory: 'public/images', publicPath: '/images/' }),
        portraitAlt: fields.text({ label: 'Alt Text do Retrato', description: ALT_TEXT_HELP }),
        portraitAltEn: enField('Alt Text do Retrato'),
      },
    }),

    where: singleton({
      label: 'Onde me encontrar',
      path: 'src/content/singletons/where',
      format: { data: 'json' },
      schema: {
        studioPhoto: fields.image({ label: 'Foto do Estúdio', directory: 'public/images', publicPath: '/images/' }),
        studioPhotoAlt: fields.text({ label: 'Alt Text da Foto', description: ALT_TEXT_HELP }),
        studioPhotoAltEn: enField('Alt Text da Foto'),
        tourCities: fields.array(
          fields.object({
            name: fields.text({ label: 'Cidade' }),
            dates: fields.text({ label: 'Datas', description: 'ex: Jul 21–25' }),
          }),
          { label: 'Datas do Eurotour', itemLabel: (props) => props.fields.name.value || 'Cidade' }
        ),
      },
    }),

    booking: singleton({
      label: 'Agendamento',
      path: 'src/content/singletons/booking',
      format: { data: 'json' },
      schema: {
        intro: fields.text({ label: 'Texto Introdutório (seção Agendar)', multiline: true }),
        introEn: enField('Texto Introdutório', true),
        flashIntro: fields.text({ label: 'Texto Introdutório (formulário na página de Flash)', multiline: true }),
        flashIntroEn: enField('Texto Introdutório (Flash)', true),
        illustration: fields.image({ label: 'Ilustração Decorativa', directory: 'public/images', publicPath: '/images/' }),
      },
    }),

    footer: singleton({
      label: 'Rodapé',
      path: 'src/content/singletons/footer',
      format: { data: 'json' },
      schema: {
        location: fields.text({ label: 'Linha de Localização', defaultValue: 'Magia além da pele · São Paulo' }),
        locationEn: enField('Linha de Localização'),
        email: fields.text({ label: 'E-mail', defaultValue: 'ssamambaiana@gmail.com' }),
        instagramUrl: fields.url({ label: 'Link do Instagram' }),
        shopUrl: fields.url({ label: 'Link da Loja' }),
      },
    }),

    seo: singleton({
      label: 'SEO / Meta',
      path: 'src/content/singletons/seo',
      format: { data: 'json' },
      schema: {
        homepage: seoPageFields('homepage', 'Homepage'),
        flash: seoPageFields('flash', 'Página de Flash'),
      },
    }),

    privacy: singleton({
      label: 'Política de Privacidade',
      path: 'src/content/singletons/privacy',
      format: { data: 'json' },
      schema: {
        // TODO: placeholder — replace with the real LGPD-compliant privacy
        // policy text once available. See suleika-portfolio's datenschutz
        // singleton (GDPR) for the equivalent structure if a more granular,
        // per-section layout is wanted later.
        body: fields.text({ label: 'Conteúdo', multiline: true }),
      },
    }),

    terms: singleton({
      label: 'Termos de Uso',
      path: 'src/content/singletons/terms',
      format: { data: 'json' },
      schema: {
        body: fields.text({ label: 'Conteúdo', multiline: true }),
      },
    }),
  },

  collections: {
    portfolio: collection({
      label: 'Portfólio (Trabalhos)',
      // Fixed 8 slots — the mosaic grid layout is hand-tuned in code per slot
      // position (see PORTFOLIO_LAYOUT in src/pages/index.astro), so this
      // collection only ever swaps the photo/alt text in each of the 8 slots.
      slugField: 'label',
      path: 'src/content/portfolio/*',
      format: { data: 'json' },
      columns: ['label', 'order'],
      schema: {
        label: fields.slug({
          name: {
            label: 'Slot',
            description: 'Apenas um rótulo interno — não aparece no site. Não adicione ou remova itens; edite a foto de um dos 8 existentes.',
          },
        }),
        order: fields.integer({ label: 'Posição no Grid (0-7)', validation: { min: 0, max: 7 } }),
        image: fields.image({ label: 'Foto', directory: 'public/images', publicPath: '/images/' }),
        imageAlt: fields.text({ label: 'Alt Text', description: ALT_TEXT_HELP }),
        imageAltEn: enField('Alt Text'),
      },
    }),

    flash: collection({
      label: 'Flash',
      slugField: 'title',
      path: 'src/content/flash/*',
      format: { data: 'json' },
      columns: ['title', 'status', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Nome do Desenho' } }),
        titleEn: enField('Nome do Desenho'),
        order: fields.integer({ label: 'Ordem de Exibição', defaultValue: 0 }),
        image: fields.image({ label: 'Imagem', directory: 'public/images', publicPath: '/images/' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Disponível', value: 'available' },
            { label: 'Reservado', value: 'reserved' },
            { label: 'Indisponível', value: 'taken' },
          ],
          defaultValue: 'available',
        }),
      },
    }),

    testimonials: collection({
      label: 'Depoimentos',
      slugField: 'name',
      path: 'src/content/testimonials/*',
      format: { data: 'json' },
      columns: ['name', 'order'],
      schema: {
        name: fields.slug({ name: { label: 'Nome da Cliente' } }),
        quote: fields.text({ label: 'Depoimento', multiline: true }),
        quoteEn: enField('Depoimento', true),
        order: fields.integer({ label: 'Ordem de Exibição', defaultValue: 0 }),
      },
    }),

    faq: collection({
      label: 'Perguntas Frequentes',
      slugField: 'question',
      path: 'src/content/faq/*',
      format: { data: 'json' },
      columns: ['question', 'order'],
      schema: {
        question: fields.slug({ name: { label: 'Pergunta' } }),
        questionEn: enField('Pergunta'),
        answer: fields.text({ label: 'Resposta', multiline: true }),
        answerEn: enField('Resposta', true),
        order: fields.integer({ label: 'Ordem de Exibição', defaultValue: 0 }),
      },
    }),

    otherWork: collection({
      label: 'Outros Trabalhos (Loja)',
      slugField: 'label',
      path: 'src/content/other-work/*',
      format: { data: 'json' },
      columns: ['label', 'order'],
      schema: {
        label: fields.slug({ name: { label: 'Nome' } }),
        labelEn: enField('Nome'),
        image: fields.image({ label: 'Foto', directory: 'public/images', publicPath: '/images/' }),
        url: fields.url({ label: 'Link da Loja' }),
        order: fields.integer({ label: 'Ordem de Exibição', defaultValue: 0 }),
      },
    }),
  },
});
