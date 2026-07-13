export type EqualGroupsVisual = {
  ariaLabel: string;
  groupSingular: string;
  groupPlural: string;
  groupEmoji: string;
  itemSingular: string;
  itemPlural: string;
  itemEmoji: string;
};

export function EqualGroupsBoard({
  id,
  groups,
  each,
  visual,
}: {
  id: string;
  groups: number;
  each: number;
  visual: EqualGroupsVisual;
}) {
  return (
    <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-4" aria-label={visual.ariaLabel}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#72543e]">Math picture · Equal groups</p>
          <p className="mt-0.5 text-xs font-bold text-[#5f6b5d]">Every group gets the same number.</p>
        </div>
        <p className="rounded-md bg-[#f0c84b] px-3 py-2 text-2xl font-black text-[#102f36]">{groups} × {each} = ?</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: groups }, (_, index) => (
          <div data-math-group key={`${id}-group-${index}`} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] px-2 py-2 text-center shadow-[2px_2px_0_#092421]">
            <p className="text-[10px] font-black uppercase tracking-[0.06em] text-[#2f6547]"><span aria-hidden="true">{visual.groupEmoji} </span>{visual.groupSingular} {index + 1}</p>
            <p className="mt-1 break-words text-lg leading-[1.05]" aria-hidden="true">
              {each <= 6 ? Array.from({ length: each }, () => visual.itemEmoji).join("") : `${visual.itemEmoji} × ${each}`}
            </p>
            <p className="mt-0.5 text-[11px] font-black text-[#9f3f2b]">{each} {each === 1 ? visual.itemSingular : visual.itemPlural}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
