import { useMemo, useState } from "react";
import {
  DEMO_CLUSTERS,
  FRESHNESS_LEVELS,
  nextOrderId,
  scheduleOrders,
  summarizeOrders,
} from "./scheduler.js";

const seedOrders = [
  {
    id: "CF-101",
    customer: "Retail account 028",
    customerType: "Retail",
    cluster: "Central",
    produce: "Mixed seasonal produce",
    quantityLb: 180,
    freshness: "urgent",
    createdAt: "2026-09-21T08:10:00.000Z",
  },
  {
    id: "CF-102",
    customer: "Restaurant account 04",
    customerType: "Restaurant",
    cluster: "East",
    produce: "Leafy greens",
    quantityLb: 95,
    freshness: "soon",
    createdAt: "2026-09-21T08:30:00.000Z",
  },
  {
    id: "CF-103",
    customer: "Wholesale account 07",
    customerType: "Wholesale",
    cluster: "North",
    produce: "Mixed seasonal produce",
    quantityLb: 420,
    freshness: "standard",
    createdAt: "2026-09-21T09:00:00.000Z",
  },
  {
    id: "CF-104",
    customer: "Retail account 113",
    customerType: "Retail",
    cluster: "East",
    produce: "Fresh fruit assortment",
    quantityLb: 140,
    freshness: "urgent",
    createdAt: "2026-09-21T09:25:00.000Z",
  },
];

const historicalMetrics = [
  { value: "150+", label: "retail customers" },
  { value: "10", label: "restaurants" },
  { value: "15+", label: "wholesale resellers" },
  { value: "~4,500 lb", label: "monthly seasonal volume" },
  { value: "15%", label: "minimum spoilage reduction" },
];

function OrderForm({ onAdd }) {
  const [form, setForm] = useState({
    customer: "",
    customerType: "Retail",
    cluster: "Central",
    produce: "Mixed seasonal produce",
    quantityLb: "",
    freshness: "soon",
  });
  const [saved, setSaved] = useState(false);

  function update(field) {
    return (event) => {
      setSaved(false);
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function submit(event) {
    event.preventDefault();
    if (!form.customer.trim() || Number(form.quantityLb) <= 0) return;

    onAdd({
      ...form,
      customer: form.customer.trim(),
      quantityLb: Number(form.quantityLb),
    });
    setForm((current) => ({ ...current, customer: "", quantityLb: "" }));
    setSaved(true);
  }

  return (
    <form className="order-form" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">ORDER INTAKE</p>
          <h2>New supply request</h2>
        </div>
        <span className="demo-pill">Demo</span>
      </div>

      <label>
        Customer account
        <input
          value={form.customer}
          onChange={update("customer")}
          placeholder="Account name or number"
          required
        />
      </label>

      <div className="field-row">
        <label>
          Account type
          <select value={form.customerType} onChange={update("customerType")}>
            <option>Retail</option>
            <option>Restaurant</option>
            <option>Wholesale</option>
          </select>
        </label>
        <label>
          Geographic cluster
          <select value={form.cluster} onChange={update("cluster")}>
            {DEMO_CLUSTERS.map((cluster) => (
              <option key={cluster}>{cluster}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Produce request
        <select value={form.produce} onChange={update("produce")}>
          <option>Mixed seasonal produce</option>
          <option>Leafy greens</option>
          <option>Fresh fruit assortment</option>
          <option>Vegetable assortment</option>
        </select>
      </label>

      <div className="field-row">
        <label>
          Weight (lb)
          <input
            type="number"
            min="1"
            step="1"
            value={form.quantityLb}
            onChange={update("quantityLb")}
            placeholder="0"
            required
          />
        </label>
        <label>
          Freshness constraint
          <select value={form.freshness} onChange={update("freshness")}>
            {Object.entries(FRESHNESS_LEVELS).map(([key, level]) => (
              <option key={key} value={key}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="primary-button" type="submit">
        Add to weekly queue <span>→</span>
      </button>
      <p className={`saved-message ${saved ? "visible" : ""}`}>
        Request centralized and ready for scheduling.
      </p>
    </form>
  );
}

function Queue({ orders, onRemove }) {
  return (
    <section className="panel queue-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CENTRALIZED REQUESTS</p>
          <h2>Weekly order queue</h2>
        </div>
        <span>{orders.length} open</span>
      </div>

      <div className="order-list">
        {orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div className={`priority-marker ${order.freshness}`} />
            <div className="order-main">
              <div className="order-title-line">
                <h3>{order.customer}</h3>
                <span>{order.id}</span>
              </div>
              <p>{order.produce}</p>
              <div className="order-tags">
                <span>{order.customerType}</span>
                <span>{order.cluster} cluster</span>
                <span>{FRESHNESS_LEVELS[order.freshness].label}</span>
              </div>
            </div>
            <div className="order-weight">
              <strong>{Number(order.quantityLb).toLocaleString()}</strong>
              <span>lb</span>
            </div>
            <button
              className="remove-button"
              onClick={() => onRemove(order.id)}
              aria-label={`Remove ${order.id}`}
            >
              ×
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function DispatchPlan({ dispatches }) {
  return (
    <section className="panel dispatch-panel">
      <div className="section-heading dispatch-heading">
        <div>
          <p className="eyebrow">AUTOMATED SCHEDULING</p>
          <h2>Geographic dispatch plan</h2>
        </div>
        <div className="circuit-handoff">
          <span>Route planning</span>
          <strong>Circuit</strong>
        </div>
      </div>

      <p className="method-note">
        Requests are grouped by geographic cluster, then prioritized by freshness
        constraint and intake time.
      </p>

      <div className="dispatch-grid">
        {dispatches.map((dispatch) => (
          <article className="dispatch-card" key={dispatch.cluster}>
            <div className="dispatch-number">{dispatch.sequence}</div>
            <div>
              <p className="dispatch-label">Dispatch cluster</p>
              <h3>{dispatch.cluster}</h3>
            </div>
            <div className="dispatch-total">
              <strong>{dispatch.totalWeight.toLocaleString()} lb</strong>
              <span>{dispatch.orderCount} orders</span>
            </div>
            <ol>
              {dispatch.orders.map((order) => (
                <li key={order.id}>
                  <span>{order.id}</span>
                  <span>{FRESHNESS_LEVELS[order.freshness].label}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [orders, setOrders] = useState(seedOrders);
  const summary = useMemo(() => summarizeOrders(orders), [orders]);
  const dispatches = useMemo(() => scheduleOrders(orders), [orders]);

  function addOrder(order) {
    setOrders((current) => [
      ...current,
      {
        ...order,
        id: nextOrderId(current),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function removeOrder(id) {
    setOrders((current) => current.filter((order) => order.id !== id));
  }

  function resetDemo() {
    setOrders(seedOrders);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Coquimbo Fresh home">
          <span className="brand-mark">CF</span>
          <span>
            <strong>Coquimbo Fresh</strong>
            <small>AgroLogistics operations</small>
          </span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" />
          Portfolio workflow reconstruction
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow light">2019—2024 · SANTIAGO, CHILE</p>
            <h1>From weekly orders to freshness-aware dispatch.</h1>
            <p>
              A working reconstruction of the ordering and scheduling workflow
              used to centralize supply requests and prepare geographic delivery
              batches.
            </p>
          </div>
          <div className="season-card">
            <span>Operating model</span>
            <strong>3-month annual season</strong>
            <p>Historical scale shown below. Queue data is synthetic.</p>
          </div>
        </section>

        <section className="metrics-strip" aria-label="Historical operation metrics">
          {historicalMetrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className="workspace">
          <aside>
            <OrderForm onAdd={addOrder} />
            <div className="queue-summary">
              <p className="eyebrow">DEMO QUEUE</p>
              <div>
                <span>Orders</span>
                <strong>{summary.orders}</strong>
              </div>
              <div>
                <span>Weight</span>
                <strong>{summary.weight.toLocaleString()} lb</strong>
              </div>
              <div>
                <span>Clusters</span>
                <strong>{summary.clusters}</strong>
              </div>
              <button onClick={resetDemo}>Reset sample data</button>
            </div>
          </aside>

          <div className="operations-column">
            <Queue orders={orders} onRemove={removeOrder} />
            <DispatchPlan dispatches={dispatches} />
          </div>
        </section>
      </main>

      <footer>
        <span>Coquimbo Fresh operations reconstruction</span>
        <span>Ordering · Scheduling · Route planning workflow</span>
      </footer>
    </div>
  );
}
