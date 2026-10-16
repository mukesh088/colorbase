import type { CSSProperties } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Command,
  CreditCard,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import { tokenMap, type ColorSystem } from "@/lib/copilot/types";
import { readableInk, type ThemeTemplate } from "@/lib/theme-builder";
import "./theme-builder.css";

/** Presentational sample; preview actions are deliberately not working app controls. */
export function ThemePreview({
  system,
  template = "dashboard",
  compact = false,
}: {
  system: ColorSystem;
  template?: ThemeTemplate;
  compact?: boolean;
}) {
  const t = tokenMap(system);
  const style = {
    "--pv-bg": t.background.hex,
    "--pv-surface": t.surface.hex,
    "--pv-elevated": t.surfaceElevated.hex,
    "--pv-text": t.text.hex,
    "--pv-muted": t.textMuted.hex,
    "--pv-border": t.border.hex,
    "--pv-primary": t.primary.hex,
    "--pv-ink": readableInk(t.primary.hex),
    "--pv-soft": t.primaryLight.hex,
    "--pv-soft-ink": readableInk(t.primaryLight.hex),
    "--pv-secondary": t.secondary.hex,
    "--pv-accent": t.accent.hex,
  } as CSSProperties;
  return (
    <div
      className={`theme-preview ${compact ? "theme-preview-compact" : ""}`}
      style={style}
      aria-label={`${system.theme} ${template} theme preview`}
    >
      {template === "dashboard" ? (
        <>
          <aside className="pv-sidebar">
            <div className="pv-wordmark">
              <span className="pv-logo">
                <Command size={17} />
              </span>
              Forma<span className="pv-plan">PRO</span>
            </div>
            <div className="pv-workspace">
              <span className="pv-avatar">F</span>
              <span>
                Forma workspace<small>Pro plan</small>
              </span>
              <ChevronDown size={12} />
            </div>
            <p className="pv-eyebrow">WORKSPACE</p>
            {[
              { icon: LayoutGrid, text: "Overview" },
              { icon: BarChart3, text: "Analytics" },
              { icon: Users, text: "Customers" },
              { icon: CreditCard, text: "Transactions" },
              { icon: Package, text: "Products" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={text} className={`pv-nav ${i === 0 ? "pv-nav-active" : ""}`}>
                <Icon size={15} />
                {text}
                {i === 2 && <span className="pv-count">24</span>}
              </div>
            ))}
            <div className="pv-sidebar-bottom">
              <div className="pv-mini-grid">
                {[t.primary.hex, t.secondary.hex, t.accent.hex, t.primaryLight.hex].map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </div>
              <p>
                Good things start
                <br />
                with a little clarity.
              </p>
              <span className="pv-muted">Your workspace, in balance.</span>
            </div>
          </aside>
          <div className="pv-main">
            <div className="pv-topbar">
              <span>
                Workspace <span className="pv-muted">/</span> Overview
              </span>
              <div>
                <Search size={14} />
                <span className="pv-avatar pv-avatar-small">JL</span>
              </div>
            </div>
            <div className="pv-content">
              <div className="pv-heading">
                <div>
                  <p className="pv-eyebrow">MONDAY, OCTOBER 12</p>
                  <h3>A little more perspective.</h3>
                  <p className="pv-muted">Welcome back, Jamie. Here’s your business at a glance.</p>
                </div>
                <span className="pv-button">
                  <Plus size={13} />
                  New report
                </span>
              </div>
              <div className="pv-metrics">
                {[
                  {
                    label: "Total revenue",
                    value: "$48,295",
                    change: "+12.8%",
                    bars: [24, 36, 28, 47, 35, 58, 46, 65],
                  },
                  {
                    label: "Active customers",
                    value: "2,420",
                    change: "+8.2%",
                    bars: [22, 30, 36, 27, 49, 44, 57, 62],
                  },
                  {
                    label: "Conversion rate",
                    value: "4.82%",
                    change: "+2.4%",
                    bars: [18, 31, 25, 40, 35, 55, 47, 63],
                  },
                ].map((metric) => (
                  <div className="pv-card pv-metric" key={metric.label}>
                    <span className="pv-muted">{metric.label}</span>
                    <MoreHorizontal size={14} className="pv-metric-more" />
                    <strong>{metric.value}</strong>
                    <div className="pv-metric-footer">
                      <span className="pv-change">
                        <ArrowUpRight size={11} />
                        {metric.change}
                      </span>
                      <div className="pv-spark-bars">
                        {metric.bars.map((height, i) => (
                          <i key={i} style={{ height: `${height}%`, opacity: 0.25 + i * 0.1 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pv-chart-grid">
                <div className="pv-card pv-chart-card">
                  <div className="pv-section-heading">
                    <div>
                      <strong>Revenue overview</strong>
                      <p className="pv-muted">A steady step in the right direction.</p>
                    </div>
                    <span className="pv-pill">
                      This month <ChevronDown size={10} />
                    </span>
                  </div>
                  <div className="pv-chart">
                    <div className="pv-axis">
                      <span>$60k</span>
                      <span>$40k</span>
                      <span>$20k</span>
                      <span>$0</span>
                    </div>
                    <svg
                      viewBox="0 0 500 145"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label="Sample revenue line chart"
                    >
                      <path
                        d="M0 25H500M0 68H500M0 111H500"
                        stroke="var(--pv-border)"
                        strokeDasharray="4 5"
                        fill="none"
                      />
                      <path
                        d="M0 128 C25 128 30 90 55 92 S90 120 115 92 S155 108 185 65 S220 90 250 60 S285 80 320 35 S355 65 390 28 S450 46 500 12 L500 145 L0 145Z"
                        fill="var(--pv-soft)"
                      />
                      <path
                        d="M0 128 C25 128 30 90 55 92 S90 120 115 92 S155 108 185 65 S220 90 250 60 S285 80 320 35 S355 65 390 28 S450 46 500 12"
                        stroke="var(--pv-primary)"
                        strokeWidth="3"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="pv-months">
                    <span>Oct 1</span>
                    <span>Oct 7</span>
                    <span>Oct 14</span>
                    <span>Oct 21</span>
                    <span>Oct 28</span>
                  </div>
                </div>
                <div className="pv-card pv-sources">
                  <strong>Top channels</strong>
                  <p className="pv-muted">Where people find you.</p>
                  {[
                    { label: "Direct", width: 84, value: "48%", color: t.primary.hex },
                    { label: "Organic", width: 60, value: "32%", color: t.secondary.hex },
                    { label: "Referral", width: 36, value: "20%", color: t.accent.hex },
                  ].map((source) => (
                    <div className="pv-source" key={source.label}>
                      <div>
                        <span>{source.label}</span>
                        <span className="pv-muted">{source.value}</span>
                      </div>
                      <div className="pv-track">
                        <span style={{ width: `${source.width}%`, background: source.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="pv-source-note">
                    <ArrowUpRight size={14} />
                    Organic traffic is growing.
                  </div>
                </div>
              </div>
              <div className="pv-card pv-table">
                <div className="pv-section-heading">
                  <strong>Recent transactions</strong>
                  <span className="pv-muted">
                    View all <ArrowRight size={12} />
                  </span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { initials: "AK", name: "Alex Kim", amount: "$240.00" },
                      { initials: "MR", name: "Morgan Reed", amount: "$129.00" },
                    ].map((row) => (
                      <tr key={row.initials}>
                        <td>
                          <span className="pv-avatar pv-avatar-small">{row.initials}</span>
                          {row.name}
                        </td>
                        <td>
                          <span className="pv-status">
                            <Check size={10} />
                            Completed
                          </span>
                        </td>
                        <td>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : template === "landing" ? (
        <div className="pv-landing">
          <div className="pv-site-nav">
            <span className="pv-wordmark">
              <Command size={19} />
              Forma
            </span>
            <span className="pv-muted">Product · Studio · Journal</span>
            <span className="pv-button">
              Get started <ArrowUpRight size={12} />
            </span>
          </div>
          <div className="pv-landing-hero">
            <p className="pv-eyebrow">LESS NOISE. MORE POSSIBILITY.</p>
            <h3>
              Make room for
              <br />
              your next big idea<span style={{ color: t.primary.hex }}>.</span>
            </h3>
            <p className="pv-muted">
              A thoughtful space for ambitious teams. Bring your work together and move forward with
              clarity.
            </p>
            <div className="pv-landing-actions">
              <span className="pv-button">
                Start your project <ArrowRight size={13} />
              </span>
              <span className="pv-muted">Explore the studio ↗</span>
            </div>
            <div className="pv-abstract">
              <div className="pv-abstract-orbit" />
              <div className="pv-abstract-circle" />
              <div className="pv-abstract-square" />
              <div className="pv-abstract-small" />
              <span className="pv-abstract-label">
                Built for what’s next. <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
          <div className="pv-landing-features">
            {[
              { label: "01 / INTENTIONAL", title: "Designed for focus", icon: SlidersHorizontal },
              { label: "02 / CONNECTED", title: "Better, together", icon: Users },
              { label: "03 / ADAPTABLE", title: "Space to grow", icon: ArrowDownLeft },
            ].map(({ label, title, icon: Icon }) => (
              <div className="pv-card" key={label}>
                <Icon size={19} />
                <p className="pv-eyebrow">{label}</p>
                <strong>{title}</strong>
                <p className="pv-muted">Considered details. A calmer way to work.</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pv-store">
          <div className="pv-store-banner">Considered objects. Everyday rituals.</div>
          <div className="pv-site-nav">
            <span className="pv-wordmark">form & field</span>
            <span className="pv-muted">Shop · Our story · Journal</span>
            <ShoppingBag size={18} />
          </div>
          <div className="pv-store-heading">
            <div>
              <p className="pv-eyebrow">THE EVERYDAY COLLECTION</p>
              <h3>
                Simple things.
                <br />
                Made to stay.
              </h3>
              <p className="pv-muted">Objects with purpose, color with feeling.</p>
            </div>
            <span className="pv-button">
              Explore collection <ArrowUpRight size={13} />
            </span>
          </div>
          <div className="pv-products">
            {[
              { name: "Arc table light", price: "$89", tone: t.primaryLight.hex, shape: "lamp" },
              { name: "Everyday vessel", price: "$42", tone: t.secondary.hex, shape: "vase" },
              { name: "Studio notebook", price: "$24", tone: t.accent.hex, shape: "book" },
            ].map((product) => (
              <div key={product.name}>
                <div className="pv-product-art" style={{ background: product.tone }}>
                  <span className={`pv-object pv-object-${product.shape}`} />
                  <span className="pv-product-tag">NEW</span>
                </div>
                <div className="pv-product-title">
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>
                <p className="pv-muted">Made for everyday moments.</p>
              </div>
            ))}
          </div>
          <div className="pv-store-bottom">
            <span>
              <Star size={13} /> Thoughtfully made
            </span>
            <span>
              Free shipping over $100 <ArrowRight size={13} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
