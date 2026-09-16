import type { Sale } from "@/types/inventory";
import { formatPeso } from "@/lib/currency";

function buildReceiptHtml(sale: Sale): string {
  const date = new Date(sale.createdAt);
  const lines = sale.items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.productName)} × ${item.quantity}</td><td align="right">${formatPeso(item.subtotal)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Receipt ${escapeHtml(sale.receiptNo)}</title>
<style>
  body { font-family: monospace; font-size: 12px; max-width: 280px; margin: 16px auto; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 8px; }
  .meta { text-align: center; font-size: 10px; color: #444; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; vertical-align: top; }
  .total { font-weight: bold; border-top: 1px dashed #999; margin-top: 8px; padding-top: 8px; }
</style></head><body>
<h1>PinoyStock POS</h1>
<div class="meta">${date.toLocaleString()}<br/>Receipt: ${escapeHtml(sale.receiptNo)}<br/>Cashier: ${escapeHtml(sale.cashierName)}</div>
<table>${lines}</table>
<div class="total">
<p>Subtotal: ${formatPeso(sale.subtotal)}</p>
${sale.discount > 0 ? `<p>Discount: -${formatPeso(sale.discount)}</p>` : ""}
${sale.tax > 0 ? `<p>Tax: ${formatPeso(sale.tax)}</p>` : ""}
<p>TOTAL: ${formatPeso(sale.total)}</p>
<p>Payment: ${escapeHtml(sale.paymentMethod)}</p>
${sale.paymentMethod === "cash" ? `<p>Paid: ${formatPeso(sale.amountPaid)} · Change: ${formatPeso(sale.change)}</p>` : ""}
</div>
<p style="text-align:center;margin-top:16px;font-size:10px;">Salamat sa pagbili!</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Best-effort print; sale is already persisted before calling this. */
export async function printSaleReceipt(
  sale: Sale,
): Promise<"printed" | "no_printer"> {
  if (typeof window === "undefined") return "no_printer";

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc || typeof win.print !== "function") {
      iframe.remove();
      resolve("no_printer");
      return;
    }

    doc.open();
    doc.write(buildReceiptHtml(sale));
    doc.close();

    let settled = false;
    const finish = (result: "printed" | "no_printer") => {
      if (settled) return;
      settled = true;
      iframe.remove();
      resolve(result);
    };

    win.onafterprint = () => finish("printed");

    window.setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        finish("no_printer");
        return;
      }
      window.setTimeout(() => {
        if (!settled) finish("printed");
      }, 2500);
    }, 300);
  });
}
