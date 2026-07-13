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
  const anchorGroups = groups > 10 ? 10 : groups > 5 ? 5 : 0;
  const extraGroups = groups - anchorGroups;
  const anchorProduct = anchorGroups * each;
  const extraProduct = extraGroups * each;
  const skipCounts = Array.from({ length: groups }, (_, index) => (index + 1) * each);

  return (
    <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-4" aria-label={visual.ariaLabel}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#72543e]">Math model · Equal groups</p>
          <p className="mt-0.5 text-xs font-bold text-[#5f6b5d]"><span aria-hidden="true">{visual.groupEmoji} </span>{groups} {groups === 1 ? visual.groupSingular : visual.groupPlural}, with {each} {each === 1 ? visual.itemSingular : visual.itemPlural} in each.</p>
        </div>
        <p className="rounded-md bg-[#f0c84b] px-3 py-2 text-2xl font-black text-[#102f36]">{groups} × {each} = ?</p>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(190px,.8fr)]">
        <div className="rounded-lg border-2 border-[#092421] bg-white p-3 shadow-[2px_2px_0_#092421]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">Array · groups down, {each} across</p>
            <p className="text-[10px] font-black text-[#5f6b5d]">Each row is one {visual.groupSingular}</p>
          </div>
          <div className="mt-2 grid gap-1.5" aria-label={`${groups} rows with ${each} in each row`}>
            {Array.from({ length: groups }, (_, groupIndex) => (
              <div
                data-math-group
                key={`${id}-group-${groupIndex}`}
                className={`grid min-h-5 items-center gap-1 rounded-md border px-2 py-1 ${anchorGroups && groupIndex >= anchorGroups ? "border-[#9f3f2b] bg-[#fff1bf]" : "border-[#2f665d] bg-[#e9ffe9]"}`}
                style={{ gridTemplateColumns: `repeat(${each}, minmax(0, 1fr))` }}
                aria-label={`${visual.groupSingular} ${groupIndex + 1}: ${each} ${each === 1 ? visual.itemSingular : visual.itemPlural}`}
              >
                {Array.from({ length: each }, (_, itemIndex) => (
                  <span key={`${id}-${groupIndex}-${itemIndex}`} className={`mx-auto h-3.5 w-3.5 rounded-full border border-[#092421] ${anchorGroups && groupIndex >= anchorGroups ? "bg-[#f0c84b]" : "bg-[#70d392]"}`} aria-hidden="true" />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {anchorGroups > 0 ? (
            <div className="flex-1 rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[2px_2px_0_#092421]" aria-label="Break apart multiplication strategy">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">Break it apart</p>
              <p className="mt-1 text-sm font-black text-[#102f36]">Use a fact you know, then add the rest.</p>
              <div className="mt-3 grid gap-2 text-center text-sm font-black">
                <p className="rounded-md border-2 border-[#2f665d] bg-[#e9ffe9] px-2 py-2">{anchorGroups} × {each} = {anchorProduct}</p>
                <p className="rounded-md border-2 border-[#9f3f2b] bg-[#fff1bf] px-2 py-2">{extraGroups} × {each} = {extraProduct}</p>
                <p className="text-xl text-[#9f3f2b]">{anchorProduct} + {extraProduct} = ?</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[2px_2px_0_#092421]" aria-label="Skip counting multiplication strategy">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">Skip-count by {each}</p>
              <p className="mt-1 text-sm font-black text-[#102f36]">One stop for every equal group.</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skipCounts.map((count, index) => <span key={`${id}-count-${count}`} className="grid h-9 min-w-9 place-items-center rounded-full border-2 border-[#092421] bg-[#e9ffe9] px-1 text-xs font-black"><span className="sr-only">Group {index + 1}: </span>{count}</span>)}
              </div>
            </div>
          )}
          <p className="rounded-lg bg-[#102f36] px-3 py-2 text-center text-xs font-black text-white">Array → strategy → equation</p>
        </div>
      </div>
    </div>
  );
}
