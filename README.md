# Detalz — Design System da Landing Page

Sistema de design e landing page da **Detalz**, a plataforma de inteligência
operacional do móvel sob medida.

A tese da marca — **"o detalhe não se perde no caminho"** — não é só o título do
herói. Ela é a regra que decide o sistema: dado técnico sempre em mono, estado
sempre com motivo, sugestão de IA sempre com casca própria, movimento sempre
com contrato declarado.

```
Detalz/
├── index.html               Home institucional (/)
├── para-industrias/
│   └── index.html           Página para indústrias (/para-industrias/)
├── para-lojistas/
│   └── index.html           Página para lojistas (/para-lojistas/)
├── para-marcenarias/
│   └── index.html           Página para marcenarias (/para-marcenarias/)
├── design-system.html       Referência viva: tokens, componentes, movimento
├── 404.html                 Página de erro (estática, sem JS/GSAP)
├── robots.txt                SEO: liberação de indexação + sitemap
├── sitemap.xml               SEO: mapa das 4 páginas do site
├── assets/
│   ├── brand/               Logotipo, marca reduzida, favicon, Open Graph
│   ├── css/
│   │   ├── tokens.css       Cor, tipografia, espaço, forma, elevação, motion
│   │   ├── base.css         Reset + primitivas .ds-* + layout
│   │   ├── components.css   Superfícies, ações, dados, navegação, set-pieces
│   │   └── motion.css       Estados pré-animação, keyframes, reduced-motion
│   └── js/
│       └── motion.js        Engine GSAP + ScrollTrigger + Lenis
├── docs/
│   └── copy-site.md         Copy consolidado de todas as páginas (fonte de conteúdo)
├── package.json             Scripts de servidor local (sem dependências)
└── README.md
```

## Rotas

Cada página do site vive em sua própria pasta com um `index.html`, o padrão
estático que qualquer servidor (local ou de produção) resolve como URL limpa:

| Rota | Arquivo |
| --- | --- |
| `/` | `index.html` |
| `/para-industrias/` | `para-industrias/index.html` |
| `/para-lojistas/` | `para-lojistas/index.html` |
| `/para-marcenarias/` | `para-marcenarias/index.html` |
| `/design-system.html` | `design-system.html` (referência interna, fora da navegação) |
| qualquer rota inexistente | `404.html` |

Para criar uma nova página de público, replique uma pasta existente (ex.
`para-marcenarias/`), ajuste o conteúdo e adicione o link nos três lugares que
apontam para as páginas de público: o `nav-links`/`mobile-menu` do header e a
coluna "Soluções" do rodapé — presentes nas 4 páginas — e a entrada
correspondente em `sitemap.xml`.

Todo asset é referenciado por caminho relativo (`assets/...` na raiz,
`../assets/...` dentro de cada subpasta), então o site inteiro funciona sem
nenhuma configuração de servidor, redirecionamento ou variável de ambiente.

## Rodando localmente

Sem build. Sem framework. Duas formas de servir os arquivos estáticos:

```bash
npm run dev
# ou, direto:
python3 -m http.server 4321
```

Depois, abra:

- http://localhost:4321/
- http://localhost:4321/para-industrias/
- http://localhost:4321/para-lojistas/
- http://localhost:4321/para-marcenarias/
- http://localhost:4321/design-system.html

Dependências vêm por CDN: GSAP 3.12.5, ScrollTrigger, Lenis 1.1.14 e as fontes
Inter Tight / Inter / JetBrains Mono.

## Deploy

Como cada página é uma pasta com `index.html`, o site sobe sem nenhuma
configuração extra em qualquer host estático — Netlify, Vercel, GitHub Pages,
Cloudflare Pages ou um bucket S3 atrás de um CDN. Todos eles resolvem
`/para-industrias/` para `para-industrias/index.html` nativamente.

Antes de publicar em produção:

1. Defina o domínio final e substitua `https://www.detalz.com.br` em
   `robots.txt`, `sitemap.xml` e nas tags `<link rel="canonical">` /
   `<meta property="og:url">` de cada página.
2. Configure o formulário do rodapé (`#leadForm`) para enviar a um endpoint
   real — hoje ele só existe como interface (`action="#"`).

---

## Marca

Os arquivos vivem em `assets/brand/`:

| Arquivo | Uso |
| --- | --- |
| `detalz-wordmark-white.svg` / `detalz-wordmark-black.svg` | **Logotipo oficial** (vetor). Fonte única para qualquer tamanho |
| `detalz-wordmark-white.png` / `-black.png` | Fallback raster para o SVG, derivado em 1024×173 |
| `detalz-mark-white.png` / `-black.png` | Marca reduzida (o **D**) para avatar e ícone |
| `favicon.png`, `favicon-32.png`, `apple-touch-icon.png` | Ícones de aba e de app, com fundo grafite próprio |
| `og-detalz.png` | Cartão de compartilhamento, 1200×630 |

No site o logotipo entra pela classe `.brand-logo`, que prefere o SVG e troca a
versão cromática sozinha conforme a superfície:

```css
/* assets/css/components.css */
.brand-logo {
  background-image: url("../brand/detalz-wordmark-white.png"); /* fallback */
  background-image: image-set(
    url("../brand/detalz-wordmark-white.svg") type("image/svg+xml"),
    url("../brand/detalz-wordmark-white.png") type("image/png")
  );
}
[data-surface="light"] .brand-logo {
  background-image: image-set(
    url("../brand/detalz-wordmark-black.svg") type("image/svg+xml"),
    url("../brand/detalz-wordmark-black.png") type("image/png")
  );
}
```

Navegadores que não entendem `image-set` usam a declaração PNG; os demais renderizam o vetor.

> **Nota sobre a origem dos PNG:** antes de o vetor chegar, os dois rasters foram
> gerados de um único JPEG achatado (extensão `.png`, sem alfa) em 1024×173.
> A versão preta vinha inteiramente preta — arte preta sobre fundo preto — e foi
> reconstruída a partir da branca convertendo luminância em alfa. Os PNGs ficam
> como fallback; qualquer uso novo deve partir do SVG.

---

## Cores: leia isto antes de usar em produção

O HTML do app que serviu de referência traz os **nomes** dos tokens
(`bg-mineral`, `text-mineral-contrast`, `bg-state-danger-bg`, `glass`,
`ambient-field-strong`…), mas não os valores — o CSS não veio junto.

Os valores em `tokens.css` foram **inferidos** a partir da semântica dos nomes.
`mineral` foi interpretado como verdigris (cobre oxidado): frio, técnico,
legível sobre grafite e coerente com "mineral".

Se a paleta real da Detalz for outra, a troca é de **cinco linhas**:

```css
/* assets/css/tokens.css */
--dz-mineral-700: #12564d;
--dz-mineral-600: #1a7a6c;
--dz-mineral-500: #2aa08c;
--dz-mineral-400: #3fbfa8;  /* base — fundo de botão primário */
--dz-mineral-300: #6fdcc6;  /* mineral como texto, sobre escuro */
```

Nenhum valor bruto de cor existe fora de `tokens.css`. Trocar essas linhas
reflete em toda a landing e em toda a página de documentação.

---

## Tokens

### Cor

Duas rampas primitivas e uma camada semântica.

| Camada | Papel |
| --- | --- |
| `--dz-graphite-*` | Neutro frio. Carrega toda a interface. |
| `--dz-mineral-*` | Único acento cromático. Significa "o motor da Detalz está trabalhando". |
| `--dz-danger/warn/ok/info-*` | Estado operacional. Nunca decorativo. |

A camada semântica (`--background`, `--foreground`, `--card`, `--border-subtle`,
`--mineral`, `--mineral-contrast`, `--mineral-fg`, `--state-*-bg/fg`) usa
exatamente os nomes já presentes no app, então landing e produto falam a mesma
língua sem tradução.

### Superfícies

Qualquer elemento com `data-surface` reaplica os tokens e repinta a si mesmo:

```html
<section data-surface="dark">…</section>      <!-- padrão, igual ao app -->
<section data-surface="elevated">…</section>  <!-- respiro dentro do escuro -->
<section data-surface="light">…</section>     <!-- bloco claro de contraste -->
```

O header lê o `data-surface` da seção que passa por baixo dele e copia — a
inversão de cor sai de graça, pelos tokens.

### Tipografia

Três vozes com papéis rígidos:

| Fonte | Uso |
| --- | --- |
| Inter Tight (`--font-display`) | Título e número-manchete |
| Inter (`--font-sans`) | Leitura corrida e interface |
| JetBrains Mono (`--font-mono`) | Medida, código, unidade, versão |

Mono não é enfeite. É o que dá autoridade de móvel sob medida e sinaliza
"isto é um fato verificável, não uma opinião".

Primitivas: `.ds-hero`, `.ds-display`, `.ds-title`, `.ds-heading`, `.ds-section`,
`.ds-eyebrow`, `.ds-lead`, `.ds-body`, `.ds-meta`, `.ds-technical`,
`.ds-numeric-total`, `.ds-micro`.

---

## Componentes

| Classe | Quando usar |
| --- | --- |
| `.surface-subtle` | Informação de apoio, não pede ação |
| `.card` | Objeto manipulável: projeto, peça, proposta |
| `.card-raised` | Objeto em foco, tirado da pilha |
| `.surface-operational` | A Detalz está calculando algo por você |
| `.ai-overlay-panel` | **Toda** sugestão da Talez. Sem exceção. |
| `.glass` | Cromo flutuante. Nunca para conteúdo. |
| `.btn--primary / --solid / --ghost / --quiet` | Uma primária por tela |
| `.chip--mineral / --danger / --warn / --ok / --info / --outline` | Status com motivo no rótulo |
| `.metric`, `.op-row`, `.timeline` | Padrões de dado operacional |

A escolha de superfície é semântica, não estética. Se você precisa pensar "qual
fica mais bonita", está usando a errada.

---

## Movimento

O HTML declara a intenção; `motion.js` resolve. Nenhuma animação é escrita à mão
numa página.

| Atributo | Efeito |
| --- | --- |
| `data-reveal` | Sobe 24px e aparece |
| `data-split="lines"` | Quebra em linhas mascaradas e desliza |
| `data-stagger` | Filhos entram em cascata |
| `data-clip` | Revela por `clip-path` |
| `data-line` | Régua que se desenha |
| `data-parallax="6"` | Parallax dentro do próprio quadro |
| `data-count="70" data-suffix="%"` | Contador ao entrar na tela |
| `data-num` | Contador com zero à esquerda |
| `data-type="0.4"` | Máquina de escrever, sem empurrar o layout |
| `data-words` | Palavras em cascata |
| `data-scrub-words` | Texto que acende palavra a palavra na rolagem |
| `data-marquee data-speed="-0.5" data-velocity` | Faixa infinita que acelera com a rolagem |
| `data-stack-card` | Cartão que encolhe sob o próximo |
| `data-magnetic` | Atração ao cursor |
| `data-cursor="Abrir"` | Rótulo dentro do cursor customizado |

Curvas e durações vivem em `tokens.css` (`--ease-out`, `--ease-inout`,
`--ease-entry`, `--ease-snap`, `--dur-*`). Não invente easing no componente.

### Set-pieces com pin

Duas seções são fixadas e roladas com scrub, nesta ordem obrigatória:

1. **Galeria horizontal** (`#hScroll`, `refreshPriority: 2`)
2. **Fluxo** (`#flowPin`, `refreshPriority: 1`)

Triggers com pin precisam medir antes dos reveals que vêm abaixo na página.
Se você inserir uma nova seção fixada, dê a ela a prioridade correta ou todos os
gatilhos seguintes vão disparar fora da tela.

O set-piece do fluxo é a única peça autoral do sistema: um pacote de informação
percorre Projeto → Orçamento → Engenharia → Produção acumulando atributos
(medida, material, espessura, ferragem, usinagem, custo) — e o contador de
"perdidos no caminho" fica em `00` do começo ao fim. É a tese da marca em
movimento.

### Degradação

Sem GSAP, ou com `prefers-reduced-motion: reduce`, a página vira estática e
**completa** — nunca vazia. Os estados escondidos em `motion.css` só valem
quando `.js` está no `<html>` e o motor subiu.

Três proteções que não são opcionais:

- **`history.scrollRestoration = 'manual'`** no `<head>`. As distâncias de pin
  são medidas no boot; se o navegador restaurar a rolagem antes disso, toda
  medida sai errada e as seções fixadas quebram.
- **Watchdog de 6s no preloader.** O timeline roda em rAF; numa aba em segundo
  plano ele congela e o preloader ficaria na tela para sempre com o scroll
  travado.
- **Segunda medição após `load`.** O layout ainda assenta depois do boot (altura
  do FAQ aberto, métrica final da fonte). Sem ela os pins ficam dezenas de
  pixels fora.

---

## Levando para o app (Tailwind)

O app usa Tailwind com tokens semânticos. Para compartilhar a mesma paleta,
aponte o tema para as variáveis de `tokens.css`:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      card: 'var(--card)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
      mineral: {
        DEFAULT: 'var(--mineral)',
        contrast: 'var(--mineral-contrast)',
        fg: 'var(--mineral-fg)',
      },
      'state-danger-bg': 'var(--state-danger-bg)',
      'state-danger-fg': 'var(--state-danger-fg)',
      'state-warn-bg': 'var(--state-warn-bg)',
      'state-warn-fg': 'var(--state-warn-fg)',
    },
    borderColor: {
      subtle: 'var(--border-subtle)',
      DEFAULT: 'var(--border)',
    },
    boxShadow: {
      lifted: 'var(--shadow-lifted)',
    },
    fontFamily: {
      display: 'var(--font-display)',
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
  },
}
```

As classes `.ds-*`, `.glass`, `.surface-operational` e `.ai-overlay-panel` podem
ser importadas como estão — `base.css` e `components.css` não dependem de
Tailwind.

---

## Princípios

**O motivo vem junto.** Nenhum estado, bloqueio ou sugestão aparece sem a razão
dele. Obrigar o usuário a procurar a causa é reproduzir o problema que a
plataforma existe para resolver.

**A máquina propõe, a pessoa decide.** Saída de IA nunca se disfarça de dado
confirmado. Casca própria, verbo de sugestão e uma ação humana explícita entre a
proposta e o efeito.

**Dado técnico em mono.** A troca de voz tipográfica avisa o leitor de que
aquilo é um fato antes de ele terminar de ler.

**Movimento é orientação, não enfeite.** Se remover a animação não deixa o
usuário mais perdido, ela não deveria existir.
