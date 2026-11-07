"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { colour } from "@/components/charts/chart-kit";
import { DonutChart } from "@/components/charts/donut-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { Button } from "@/components/ui/button";
import { Caption, Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/premium";
import { Segmented } from "@/components/ui/segmented";
import { Field, inputClass, Sheet } from "@/components/ui/sheet";
import { StatRow } from "@/components/ui/stat-row";
import { TableHeader, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { clinicians, formatFte } from "@/data/clinicians";
import {
  budgets,
  costsByArea,
  FORTNIGHT_HOURS_PER_FTE,
  leaveRequests,
  monthlyFinance,
  purchaseOrders,
  receivables,
  revenueByService,
  samplePayRate,
} from "@/data/operations";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/state/demo-store";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;
const thousands = (n: number) => `$${n}k`;
const sum = (list: { value: number }[]) => list.reduce((s, x) => s + x.value, 0);
const PAY = "minmax(200px,1.4fr) 90px 90px 110px 110px";
const donutColours = [colour.series1, colour.series2, colour.series3, colour.series4, colour.stone];

/** An approve or decline pair that records the decision and then shows it. */
function Decision({ opKey, action, object }: { opKey: string; action: string; object: string }) {
  const state = useDemoStore((s) => s.ops[opKey]);
  const setOp = useDemoStore((s) => s.setOp);
  if (state) {
    return (
      <Tag tone={state === "approved" ? "healthy" : "over"}>
        {state === "approved" ? "Approved" : "Declined"}
      </Tag>
    );
  }
  return (
    <span className="flex gap-1.5">
      <Button size="sm" onClick={() => setOp(opKey, "declined", `Declined ${action}`, object)}>
        Decline
      </Button>
      <Button
        size="sm"
        variant="primary"
        onClick={() => setOp(opKey, "approved", `Approved ${action}`, object)}
      >
        Approve
      </Button>
    </span>
  );
}

function Finance() {
  const revenue = sum(revenueByService);
  const costs = sum(costsByArea);
  const owed = receivables.reduce((s, r) => s + r.amount, 0);
  return (
    <>
      <StatRow
        label="Finance summary"
        stats={[
          { label: "Revenue", value: thousands(revenue), caption: "This quarter" },
          { label: "Costs", value: thousands(costs), caption: "This quarter" },
          {
            label: "Margin",
            value: `${Math.round(((revenue - costs) / revenue) * 100)}%`,
            caption: `${thousands(revenue - costs)} surplus`,
          },
          { label: "Money owed", value: money(owed), caption: `${receivables.length} funders` },
        ]}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Card aria-labelledby="erp-trend" className="px-6 pt-5 pb-4 lg:col-span-8">
          <CardTitle id="erp-trend" title="Revenue and costs" description="Last six months" />
          <div className="mt-3">
            <TrendChart
              label="Revenue and costs by month"
              data={monthlyFinance}
              xKey="month"
              height={250}
              format={thousands}
              series={[
                { key: "revenue", label: "Revenue", colour: colour.series1, kind: "area" },
                { key: "costs", label: "Costs", colour: colour.series3, kind: "line" },
              ]}
            />
          </div>
        </Card>
        <Card aria-labelledby="erp-costs" className="px-6 pt-5 pb-5 lg:col-span-4">
          <CardTitle id="erp-costs" title="Where costs go" />
          <div className="mt-4">
            <DonutChart
              label="Costs by area"
              size={140}
              centre={thousands(costs)}
              centreCaption="this quarter"
              format={thousands}
              slices={costsByArea.map((c, i) => ({
                ...c,
                colour: donutColours[i] ?? colour.stone,
              }))}
            />
          </div>
        </Card>
        <Card aria-labelledby="erp-revenue" className="px-6 pt-5 pb-4 lg:col-span-6">
          <CardTitle id="erp-revenue" title="Revenue by service" />
          <div className="mt-3">
            <BarList
              label="Revenue by service"
              data={revenueByService.map((x) => ({ ...x, colour: colour.series1 }))}
              labelWidth={150}
              format={thousands}
              unit="revenue"
            />
          </div>
        </Card>
        <Card aria-labelledby="erp-owed" className="overflow-hidden lg:col-span-6">
          <div className="px-6 pt-5 pb-3">
            <CardTitle id="erp-owed" title="Money owed to us" />
          </div>
          <ul>
            {receivables.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 border-t border-border px-6 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-small font-semibold">{r.from}</span>
                  <Caption>{r.age}</Caption>
                </span>
                <span className="headline text-section">{money(r.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function People() {
  const fte = clinicians.reduce((s, c) => s + c.fte, 0);
  const north = clinicians.filter((c) => c.site === "Brisbane North").length;
  return (
    <>
      <StatRow
        label="HR summary"
        stats={[
          { label: "Staff", value: clinicians.length, caption: `${fte.toFixed(1)} FTE` },
          { label: "Brisbane North", value: north, caption: "Clinicians" },
          { label: "Brisbane South", value: clinicians.length - north, caption: "Clinicians" },
          {
            label: "Leave requests",
            value: leaveRequests.length,
            caption: "On the list below",
          },
        ]}
      />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {clinicians.map((c) => (
            <article
              key={c.id}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-3.5 surface-lift"
            >
              <Avatar name={c.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="truncate text-caption text-ink-500">
                  {c.discipline}, {formatFte(c.fte)} FTE
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                  <i
                    className={cn(
                      "block h-full rounded-full",
                      c.utilisation >= 100
                        ? "bg-over-dot"
                        : c.utilisation >= 95
                          ? "bg-monitor-dot"
                          : "bg-accent-fill",
                    )}
                    style={{ width: `${Math.min(c.utilisation, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-caption font-semibold text-ink-700">{c.utilisation}%</span>
            </article>
          ))}
        </div>
        <Card aria-labelledby="erp-leave" className="overflow-hidden lg:col-span-5">
          <div className="px-5 pt-5 pb-3">
            <CardTitle id="erp-leave" title="Leave requests" />
          </div>
          <ul>
            {leaveRequests.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3"
              >
                <Avatar name={l.name} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{l.name}</span>
                  <Caption>
                    {l.type}, {l.dates}
                  </Caption>
                </span>
                <Decision opKey={`leave:${l.id}`} action={l.type.toLowerCase()} object={l.name} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Payroll() {
  const approved = useDemoStore((s) => s.ops["payroll:run"] === "approved");
  const setOp = useDemoStore((s) => s.setOp);
  const rows = clinicians.map((c) => {
    const hours = Math.round(c.fte * FORTNIGHT_HOURS_PER_FTE);
    const gross = hours * samplePayRate;
    return { id: c.id, name: c.name, hours, gross, super: gross * 0.12 };
  });
  const gross = rows.reduce((s, r) => s + r.gross, 0);
  const superTotal = rows.reduce((s, r) => s + r.super, 0);
  const hours = rows.reduce((s, r) => s + r.hours, 0);
  return (
    <>
      <StatRow
        label="Payroll summary"
        stats={[
          { label: "Gross pay", value: money(gross), caption: "This fortnight" },
          { label: "Superannuation", value: money(superTotal), caption: "At a sample 12%" },
          { label: "Hours", value: hours, caption: `${rows.length} staff` },
          {
            label: "Status",
            value: approved ? "Approved" : "To approve",
            caption: "Fortnightly pay run",
          },
        ]}
      />
      <Card aria-labelledby="erp-payroll" className="mt-6 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <CardTitle
            id="erp-payroll"
            title="This fortnight's pay run"
            aside={
              approved ? (
                <Tag tone="healthy">Approved</Tag>
              ) : (
                <Button
                  variant="primary"
                  onClick={() =>
                    setOp("payroll:run", "approved", "Approved fortnightly pay run", money(gross))
                  }
                >
                  Approve pay run
                </Button>
              )
            }
          />
        </div>
        <div className="overflow-x-auto" role="table" aria-label="Pay run">
          <div className="min-w-160">
            <TableHeader columns={PAY}>
              <div>Name</div>
              <div>Hours</div>
              <div>Rate</div>
              <div className="text-right">Super</div>
              <div className="text-right">Gross pay</div>
            </TableHeader>
            {rows.map((r) => (
              <TableRow key={r.id} columns={PAY}>
                <div className="flex min-w-0 items-center gap-2.5 py-2">
                  <Avatar name={r.name} size={32} />
                  <span className="truncate font-semibold">{r.name}</span>
                </div>
                <div className="text-ink-700">{r.hours}</div>
                <div className="text-ink-700">{money(samplePayRate)}</div>
                <div className="text-right text-ink-700">{money(r.super)}</div>
                <div className="text-right font-semibold">{money(r.gross)}</div>
              </TableRow>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

type NewOrder = { id: string; item: string; supplier: string; amount: number; by: string };

function Purchasing() {
  const ops = useDemoStore((s) => s.ops);
  const setOp = useDemoStore((s) => s.setOp);
  const [adding, setAdding] = useState(false);
  const [item, setItem] = useState("");
  const [supplier, setSupplier] = useState("");
  const [amount, setAmount] = useState("");
  const [tried, setTried] = useState(false);
  const added = JSON.parse(ops["po:new"] ?? "[]") as NewOrder[];
  const orders = [...added, ...purchaseOrders];
  const value = Number(amount);
  const valid = item.trim() && supplier.trim() && Number.isFinite(value) && value > 0;
  const approvedTotal = orders
    .filter((o) => ops[`po:${o.id}`] === "approved")
    .reduce((s, o) => s + o.amount, 0);
  const waiting = orders.filter((o) => !ops[`po:${o.id}`]).length;

  return (
    <>
      <StatRow
        label="Purchasing summary"
        stats={[
          { label: "Waiting", value: waiting, caption: "Need a decision" },
          { label: "Approved", value: money(approvedTotal), caption: "So far" },
          { label: "Requests", value: orders.length, caption: "In total" },
          {
            label: "Suppliers",
            value: new Set(orders.map((o) => o.supplier)).size,
            caption: "On these requests",
          },
        ]}
      />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <Card aria-labelledby="erp-orders" className="overflow-hidden lg:col-span-8">
          <div className="px-5 pt-5 pb-3">
            <CardTitle
              id="erp-orders"
              title="Purchase requests"
              aside={
                <Button variant="primary" onClick={() => setAdding(true)}>
                  <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
                  New request
                </Button>
              }
            />
          </div>
          <ul>
            {orders.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {p.item}, {money(p.amount)}
                  </span>
                  <Caption>
                    {p.supplier}, requested by {p.by}
                  </Caption>
                </span>
                <Decision opKey={`po:${p.id}`} action="purchase request" object={p.item} />
              </li>
            ))}
          </ul>
        </Card>
        <Card aria-labelledby="erp-budgets" className="px-5 py-5 lg:col-span-4">
          <CardTitle id="erp-budgets" title="Budgets" description="Spent this quarter" />
          <ul className="mt-4 flex flex-col gap-4">
            {budgets.map((b) => {
              const percent = Math.round((b.spent / b.total) * 100);
              return (
                <li key={b.id}>
                  <div className="flex justify-between gap-2 text-small">
                    <span className="font-medium">{b.label}</span>
                    <span className="text-ink-500">
                      {money(b.spent)} of {money(b.total)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
                    <i
                      className={cn(
                        "block h-full rounded-full",
                        percent >= 90 ? "bg-monitor-dot" : "bg-accent-fill",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      {adding && (
        <Sheet
          title="New purchase request"
          onClose={() => setAdding(false)}
          footer={
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setTried(true);
                  if (!valid) return;
                  const next: NewOrder = {
                    id: `new-${added.length + 1}`,
                    item: item.trim(),
                    supplier: supplier.trim(),
                    amount: value,
                    by: "Neil Hensley",
                  };
                  setOp(
                    "po:new",
                    JSON.stringify([next, ...added]),
                    "Raised purchase request",
                    next.item,
                  );
                  setItem("");
                  setSupplier("");
                  setAmount("");
                  setTried(false);
                  setAdding(false);
                }}
              >
                Create request
              </Button>
              <Button onClick={() => setAdding(false)}>Cancel</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Field
              label="What's needed"
              error={tried && !item.trim() ? "Enter the item" : undefined}
            >
              <input
                className={inputClass}
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
            </Field>
            <Field
              label="Supplier"
              error={tried && !supplier.trim() ? "Enter the supplier" : undefined}
            >
              <input
                className={inputClass}
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </Field>
            <Field
              label="Amount in dollars"
              error={tried && !(value > 0) ? "Enter an amount above zero" : undefined}
            >
              <input
                className={inputClass}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          </div>
        </Sheet>
      )}
    </>
  );
}

export function Erp() {
  const [view, setView] = useState<"finance" | "people" | "payroll" | "purchasing">("finance");
  return (
    <>
      <div className="mb-5 flex">
        <Segmented
          label="ERP section"
          value={view}
          onChange={setView}
          options={[
            { id: "finance", label: "Finance" },
            { id: "people", label: "HR" },
            { id: "payroll", label: "Payroll" },
            { id: "purchasing", label: "Purchasing" },
          ]}
        />
      </div>
      {view === "finance" && <Finance />}
      {view === "people" && <People />}
      {view === "payroll" && <Payroll />}
      {view === "purchasing" && <Purchasing />}
      <Caption className="mt-4">
        Finance, pay and purchasing figures are sample data. No accounting or payroll system is
        connected yet.
      </Caption>
    </>
  );
}
