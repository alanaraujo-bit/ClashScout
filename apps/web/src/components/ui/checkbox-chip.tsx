/**
 * Chip de filtro sem JavaScript: um checkbox escondido + `peer` do Tailwind
 * para o estado visual. Funciona dentro de um `<form method="GET">` puro, que
 * navega e deixa o Server Component recalcular o feed - zero re-render no cliente.
 */
export function CheckboxChip({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="inline-flex h-9 items-center rounded-full border border-[var(--color-separator)] px-4 text-sm font-medium transition-colors duration-200 peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-white">
        {label}
      </span>
    </label>
  );
}
