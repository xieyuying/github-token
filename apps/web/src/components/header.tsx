import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <div className="border-b border-slate-800 bg-[#0d1526]">
      <div className="mx-auto flex max-w-[1760px] items-center justify-end px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
