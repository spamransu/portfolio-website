import { InternalHero } from '../components/InternalHero'
import { siteContent } from '../content/siteContent'
import sty from './DesignSystemPage.module.scss'

const colors = [
  ['Page', '--color-background-page', 'Page background'],
  ['Surface', '--color-background-surface', 'Raised surface'],
  ['Inverse', '--color-background-inverse', 'Light surface'],
  ['Chalk', '--color-text-primary', 'Primary text'],
  ['Mist', '--color-text-muted', 'Muted text'],
  ['Acid', '--color-action-primary', 'Primary action'],
  ['Flare', '--color-action-secondary', 'Secondary accent'],
  ['Iris', '--color-accent-violet', 'Tertiary accent'],
] as const

const spacing = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

export function DesignSystemPage() {
  const content = siteContent.designSystemPage
  const projectImage = siteContent.projects.find((project) => project.image)?.image
  const section = (id: string) => content?.sections.find((item) => item.id === id)

  return (
    <div className={sty.page}>
      <InternalHero eyebrow={content?.eyebrow ?? 'Technical blueprint'} title={content?.title ?? 'Design system reference'} intro={content?.intro ?? 'The reusable visual engine behind the site.'} />

      <section className={sty.block} id="color">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('color')?.title ?? 'Color'}</p><p>{section('color')?.description}</p></header><div className={sty.swatches}>{colors.map(([name, token, role]) => <article key={token}><div style={{ background: `var(${token})` }} /><strong>{name}</strong><code>{token}</code><p>{role}</p></article>)}</div></div></div>
      </section>

      <section className={sty.block} id="type">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('type')?.title ?? 'Typography'}</p><p>{section('type')?.description}</p></header><div className={sty.typeScale}>{(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((role) => <div key={role}><code>{role.toUpperCase()}</code><p className={`text-${role}`}>Structure before decoration.</p></div>)}<div><code>BODY</code><p>Inter keeps long-form copy readable and interface labels quiet.</p></div><p className="eyebrow">Eyebrow example</p></div></div></div>
      </section>

      <section className={sty.block} id="spacing">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('spacing')?.title ?? 'Spacing'}</p><p>{section('spacing')?.description}</p></header><div className={sty.spacingScale}>{spacing.map((size) => <div key={size}><code>{size.toUpperCase()}</code><span style={{ width: `var(--space-${size})` }} /><small>{`--space-${size}`}</small></div>)}</div></div></div>
      </section>

      <section className={sty.block} id="grid">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('grid')?.title ?? 'Grid'}</p><p>{section('grid')?.description}</p></header><div><div className={sty.gridDemo}>{Array.from({ length: 12 }, (_, index) => <span key={index}>{index + 1}</span>)}</div><div className={sty.wrapperList}><article><code>SM</code><strong>700px</strong></article><article><code>MD</code><strong>960px</strong></article><article><code>LG</code><strong>1440px</strong></article></div></div></div></div>
      </section>

      <section className={sty.block} id="components">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('components')?.title ?? 'Components'}</p><p>{section('components')?.description}</p></header><div className={sty.components}>
          <div className="button-row"><button className="button button--primary">Primary</button><button className="button button--ghost">Secondary</button><button className="button" disabled>Disabled</button></div>
          <ul className="tag-list"><li>Neutral</li><li className={sty.tagAcid}>Acid</li><li className={sty.tagFlare}>Flare</li><li className={sty.tagIris}>Iris</li></ul>
          <div className={sty.fieldDemo}><label htmlFor="design-system-field">Field label</label><input id="design-system-field" placeholder="Click or tab to focus" /><small>Production focus and field treatment.</small></div>
          <div className={sty.surfaceDemo}><article><span>Card overlay</span><h3>Raised card</h3><p>Low-contrast border and restrained radius.</p></article><article><span>Top divider only</span><h3>Quiet group</h3><p>Many sections need no surrounding card.</p></article></div>
          <div className={sty.dividers}><span /><span /><span /></div>
          {projectImage ? <figure className={sty.imageDemo}><img src={projectImage.src} alt={projectImage.alt} /><figcaption>Production image treatment</figcaption></figure> : null}
        </div></div></div>
      </section>

      <section className={sty.block} id="motion">
        <div className="lg-wrapper"><div className={sty.blockGrid}><header><p className="eyebrow">{section('motion')?.title ?? 'Motion'}</p><p>{section('motion')?.description}</p></header><div className={sty.motionDemo} tabIndex={0}><span>Hover or focus</span><strong>Restrained lift</strong></div></div></div>
      </section>
    </div>
  )
}
