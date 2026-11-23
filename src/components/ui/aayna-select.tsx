"use client";

import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import "./aayna-select.css";

type Option = { value: string; label: string; disabled: boolean };
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & { children: ReactNode };

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function readOptions(children: ReactNode): Option[] {
  const result: Option[] = [];
  function visit(nodes: ReactNode) {
    Children.forEach(nodes, (node) => {
      if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(node)) return;
      if (typeof node.type === "string" && node.type === "option") {
        result.push({
          value: node.props.value === undefined ? textOf(node.props.children) : String(node.props.value),
          label: textOf(node.props.children),
          disabled: Boolean(node.props.disabled),
        });
      } else if (node.props.children) visit(node.props.children);
    });
  }
  visit(children);
  return result;
}

export function AaynaSelect({ children, value, defaultValue, onChange, disabled, required, id, name, className, "aria-label": ariaLabel, ...rest }: Props) {
  const generatedId = useId();
  const listId = `${generatedId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const [position, setPosition] = useState({ top: 0, left: 0, width: 220, above: false });
  const options = useMemo(() => readOptions(children), [children]);
  const selected = String(value ?? internalValue);
  const activeOption = options.find((option) => option.value === selected);

  function close() { setOpen(false); triggerRef.current?.focus(); }
  function choose(next: string) {
    if (disabled) return;
    if (value === undefined) setInternalValue(next);
    // Preserve the native select onChange contract used by existing forms.
    onChange?.({ target: { value: next, name: name ?? "" }, currentTarget: { value: next, name: name ?? "" } } as ChangeEvent<HTMLSelectElement>);
    close();
  }
  function place() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = Math.min(320, options.length * 52 + 16);
    const above = window.innerHeight - rect.bottom < height + 12 && rect.top > height + 12;
    setPosition({ top: above ? rect.top - 8 : rect.bottom + 8, left: Math.min(rect.left, Math.max(12, window.innerWidth - rect.width - 12)), width: rect.width, above });
  }
  function toggle() {
    if (disabled) return;
    if (open) { close(); return; }
    place(); setOpen(true);
  }
  function keyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Escape" && open) { event.preventDefault(); close(); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const enabled = options.filter((option) => !option.disabled);
      if (!enabled.length) return;
      const index = enabled.findIndex((option) => option.value === selected);
      const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : event.key === "ArrowDown" ? (index + 1) % enabled.length : (index - 1 + enabled.length) % enabled.length;
      choose(enabled[next].value);
    }
  }

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } }
    function update() { setOpen(false); }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open]);

  return <div className={`aayna-select ${className ?? ""}`}>
    <button
      ref={triggerRef} id={id} type="button" className="aayna-select-trigger"
      aria-label={ariaLabel} aria-haspopup="listbox" aria-controls={open ? listId : undefined}
      aria-expanded={open} aria-required={required || undefined} disabled={disabled}
      onClick={toggle} onKeyDown={keyDown}
    >
      <span className={`aayna-select-value ${!selected ? "aayna-select-placeholder" : ""}`}>{activeOption?.label ?? options[0]?.label ?? "Select an option"}</span>
      <ChevronDown aria-hidden="true" size={17} className={`aayna-select-chevron ${open ? "is-open" : ""}`} />
    </button>
    <select
      {...rest} name={name} value={selected} onChange={(event) => choose(event.target.value)}
      disabled={disabled} required={required} aria-hidden="true" tabIndex={-1}
      className="aayna-select-native" onInvalid={(event) => { event.preventDefault(); triggerRef.current?.focus(); }}
    >{children}</select>
    {open && typeof document !== "undefined" && createPortal(
      <div
        ref={panelRef} id={listId} role="listbox" aria-label={ariaLabel ?? "Choose an option"}
        className="aayna-select-menu" style={{ left: position.left, top: position.top, minWidth: position.width, transform: position.above ? "translateY(-100%)" : undefined }}
      >
        {options.map((option) => <button
          type="button" role="option" aria-selected={option.value === selected}
          disabled={option.disabled} key={option.value} className="aayna-select-option"
          onClick={() => choose(option.value)}
        ><span>{option.label}</span>{option.value === selected && <Check size={16} aria-hidden="true" />}</button>)}
      </div>, document.body
    )}
  </div>;
}
