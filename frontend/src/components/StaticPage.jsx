import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

/**
 * Renders one of the extracted mockup page fragments (see src/data/pages/*.js).
 * These fragments are static markup lifted from the original design file —
 * this component brings them to life:
 *  - applies live translations to [data-i18n] / [data-i18n-placeholder] nodes
 *  - turns [data-goto="route"] elements into SPA navigation
 *  - turns [data-toast="message"] elements into toast triggers
 *  - handles the generic "chip" filter row / "report-type" grid active-state toggle
 *  - triggers the temple-hero reveal animation when present
 */
export default function StaticPage({ html }) {
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  // Live i18n — re-applied whenever the language changes
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key] !== undefined) el.setAttribute("placeholder", t[key]);
    });
  }, [t, html]);

  // Temple hero reveal-on-mount animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const hero = root.querySelector(".temple-hero");
    if (!hero) return;
    const page = root.querySelector(".temple-details-page") || root;
    page.classList.remove("revealed");
    const id = setTimeout(() => {
      hero.classList.add("revealed");
      page.classList.add("revealed");
    }, 80);
    return () => clearTimeout(id);
  }, [html]);

  // Delegated click handling
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handler = (e) => {
      const chip = e.target.closest(".chip");
      if (chip && root.contains(chip)) {
        const row = chip.closest(".chip-row");
        if (row) {
          row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
        }
      }

      const reportType = e.target.closest(".report-type");
      if (reportType && root.contains(reportType)) {
        const grid = reportType.closest(".report-type-grid");
        if (grid) {
          grid.querySelectorAll(".report-type").forEach((r) => r.classList.remove("active"));
          reportType.classList.add("active");
        }
      }

      const gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        navigate(`/${gotoEl.dataset.goto}`);
      }

      const toastEl = e.target.closest("[data-toast]");
      if (toastEl) {
        showToast(toastEl.dataset.toast);
      }
    };

    root.addEventListener("click", handler);
    return () => root.removeEventListener("click", handler);
  }, [navigate, showToast, html]);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
