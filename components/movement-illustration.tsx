/**
 * Original line-figure illustrations for every movement.
 * Each pose is a set of joints; animated poses tween A → B → A with SMIL
 * (works in Safari, Chrome and Firefox, and costs no JavaScript).
 */

type P = [number, number];
type Pose = {
  head: P;
  neck: P;
  pelvis: P;
  eL: P; hL: P; eR: P; hR: P;
  kL: P; fL: P; tL: P; kR: P; fR: P; tR: P;
};
type Prop = "chair-side" | "chair-front" | "chair-support" | "wall";
type Deco =
  | { kind: "spin"; at: P; r: number }
  | { kind: "pulse"; at: P; r: number }
  | { kind: "breath"; at: P };
type Figure = { props: Prop[]; a: Pose; b?: Pose; deco?: Deco[]; dur?: number; view?: "front" };

const with_ = (base: Pose, patch: Partial<Pose>): Pose => ({ ...base, ...patch });

// Seated, side view, facing right.
const S: Pose = {
  head: [91, 44], neck: [88, 62], pelvis: [84, 118],
  eL: [94, 92], hL: [112, 106], eR: [97, 93], hR: [115, 107],
  kL: [124, 116], fL: [124, 166], tL: [138, 172],
  kR: [122, 119], fR: [121, 168], tR: [135, 173],
};
// Seated, front view.
const SF: Pose = {
  head: [100, 40], neck: [100, 58], pelvis: [100, 116],
  eL: [86, 88], hL: [86, 112], eR: [114, 88], hR: [114, 112],
  kL: [86, 128], fL: [86, 166], tL: [79, 172], kR: [114, 128], fR: [114, 166], tR: [121, 172],
};
// Standing, side view, facing right.
const T: Pose = {
  head: [100, 30], neck: [100, 48], pelvis: [100, 104],
  eL: [101, 76], hL: [103, 100], eR: [103, 77], hR: [106, 101],
  kL: [103, 140], fL: [100, 170], tL: [114, 175], kR: [101, 140], fR: [98, 171], tR: [112, 176],
};
// Standing, front view.
const TF: Pose = {
  head: [100, 30], neck: [100, 48], pelvis: [100, 104],
  eL: [88, 76], hL: [85, 100], eR: [112, 76], hR: [115, 100],
  kL: [94, 140], fL: [93, 170], tL: [86, 175], kR: [106, 140], fR: [107, 170], tR: [114, 175],
};
// Standing side, hands resting on a chair back to the right.
const TS = with_(T, { eL: [114, 76], hL: [134, 88], eR: [116, 78], hR: [136, 89] });
const armsForward = { eL: [104, 82] as P, hL: [127, 79] as P, eR: [106, 84] as P, hR: [129, 81] as P };

const FIGURES: Record<string, Figure> = {
  "shoulder-rolls": {
    props: ["chair-side"], a: S,
    b: with_(S, { head: [91, 38], neck: [88, 56], eL: [94, 87], eR: [97, 88], hL: [112, 103], hR: [115, 104] }),
    deco: [{ kind: "spin", at: [86, 66], r: 9 }], dur: 2.4,
  },
  "shoulder-squeeze": {
    props: ["chair-side"],
    a: with_(S, { eL: [97, 91], hL: [118, 84], eR: [99, 93], hR: [120, 86] }),
    b: with_(S, { eL: [75, 89], hL: [94, 80], eR: [77, 91], hR: [96, 82] }), dur: 3,
  },
  "seated-rotation": {
    view: "front",
    props: ["chair-front"],
    a: with_(SF, { eL: [84, 82], hL: [113, 74], eR: [116, 82], hR: [87, 74] }),
    b: with_(SF, { head: [105, 40], eL: [93, 82], hL: [123, 76], eR: [125, 84], hR: [97, 76] }), dur: 3.2,
  },
  "wrist-circles": {
    props: ["chair-side"], a: with_(S, armsForward),
    deco: [{ kind: "spin", at: [131, 80], r: 7 }],
  },
  "hand-openers": {
    props: ["chair-side"], a: with_(S, armsForward),
    deco: [{ kind: "pulse", at: [131, 80], r: 6 }],
  },
  "neck-tilt": {
    view: "front",
    props: ["chair-front"], a: SF, b: with_(SF, { head: [90, 43] }), dur: 4,
  },
  "chin-glide": {
    props: ["chair-side"], a: with_(S, { head: [95, 44] }), b: with_(S, { head: [87, 45] }), dur: 2.6,
  },
  "seated-side-reach": {
    view: "front",
    props: ["chair-front"], a: SF,
    b: with_(SF, { neck: [95, 59], head: [91, 42], eR: [112, 34], hR: [97, 16] }), dur: 3.6,
  },
  "seated-cat-cow": {
    props: ["chair-side"],
    a: with_(S, { neck: [99, 64], head: [107, 52], eL: [108, 94], hL: [121, 113], eR: [110, 95], hR: [122, 115] }),
    b: with_(S, { neck: [84, 60], head: [86, 42], eL: [101, 92], hL: [121, 113], eR: [103, 93], hR: [122, 115] }), dur: 4,
  },
  "seated-overhead-reach": {
    view: "front",
    props: ["chair-front"], a: SF,
    b: with_(SF, { eL: [92, 34], hL: [90, 12], eR: [108, 34], hR: [110, 12] }), dur: 3.2,
  },
  "arm-circles": {
    view: "front",
    props: ["chair-front"],
    a: with_(SF, { eL: [77, 60], hL: [54, 59], eR: [123, 60], hR: [146, 59] }),
    b: with_(SF, { eL: [77, 56], hL: [55, 51], eR: [123, 56], hR: [145, 51] }),
    deco: [{ kind: "spin", at: [54, 55], r: 6 }, { kind: "spin", at: [146, 55], r: 6 }], dur: 1.2,
  },
  "forward-reach": {
    props: ["chair-side"],
    a: with_(S, { eR: [112, 72], hR: [138, 70], eL: [96, 90], hL: [112, 78] }),
    b: with_(S, { eL: [112, 72], hL: [138, 70], eR: [96, 90], hR: [112, 78] }), dur: 1.2,
  },
  "seated-march": {
    props: ["chair-side"], a: S,
    b: with_(S, { kL: [120, 100], fL: [127, 148], tL: [141, 151] }), dur: 1.4,
  },
  "seated-heel-raise": {
    props: ["chair-side"], a: S,
    b: with_(S, { kL: [124, 110], fL: [126, 160], kR: [122, 113], fR: [123, 162] }), dur: 2,
  },
  "knee-extension": {
    props: ["chair-side"], a: S,
    b: with_(S, { fL: [171, 109], tL: [176, 96] }), dur: 3,
  },
  "ankle-circles": {
    props: ["chair-side"], a: with_(S, { kL: [125, 114], fL: [136, 160], tL: [149, 158] }),
    deco: [{ kind: "spin", at: [147, 158], r: 7 }],
  },
  "toe-taps": {
    props: ["chair-side"], a: S,
    b: with_(S, { kL: [128, 119], fL: [152, 166], tL: [163, 158] }), dur: 1.1,
  },
  breathing: {
    props: ["chair-side"], a: S, deco: [{ kind: "breath", at: [93, 88] }],
  },
  "weight-shift": {
    view: "front",
    props: [],
    a: with_(TF, { head: [95, 30], neck: [95, 48], pelvis: [94, 104], eL: [83, 76], hL: [80, 100], eR: [107, 76], hR: [110, 100], kL: [90, 140], kR: [101, 140] }),
    b: with_(TF, { head: [105, 30], neck: [105, 48], pelvis: [106, 104], eL: [93, 76], hL: [90, 100], eR: [117, 76], hR: [120, 100], kL: [99, 140], kR: [110, 140] }),
    dur: 2.8,
  },
  "standing-reach": {
    props: [], a: T,
    b: with_(T, { eL: [108, 30], hL: [118, 10], eR: [110, 31], hR: [121, 11] }), dur: 3.4,
  },
  "standing-side-reach": {
    view: "front",
    props: [], a: TF,
    b: with_(TF, { neck: [95, 49], head: [90, 32], eR: [111, 26], hR: [95, 8] }), dur: 3.6,
  },
  "chest-opener": {
    view: "front",
    props: [],
    a: with_(TF, { eL: [87, 72], hL: [98, 80], eR: [113, 72], hR: [102, 80] }),
    b: with_(TF, { eL: [77, 65], hL: [55, 61], eR: [123, 65], hR: [145, 61] }), dur: 3,
  },
  "calf-raise": {
    props: ["chair-support"], a: TS,
    b: with_(TS, { head: [100, 22], neck: [100, 40], pelvis: [100, 96], eL: [116, 70], eR: [118, 72], kL: [103, 132], kR: [101, 132], fL: [104, 163], fR: [102, 164] }),
    dur: 2.2,
  },
  "standing-march": {
    props: ["chair-support"], a: TS,
    b: with_(TS, { kL: [120, 122], fL: [116, 156], tL: [129, 158] }), dur: 1.4,
  },
  "sit-to-stand": {
    props: ["chair-side"],
    a: with_(S, { eL: [102, 88], hL: [122, 86], eR: [104, 90], hR: [124, 88] }),
    b: with_(S, {
      head: [118, 28], neck: [117, 46], pelvis: [115, 102],
      eL: [126, 72], hL: [147, 73], eR: [128, 74], hR: [149, 75],
      kL: [122, 137], kR: [120, 138],
    }),
    dur: 3.6,
  },
  "wall-push": {
    props: ["wall"],
    a: { head: [146, 46], neck: [138, 60], pelvis: [114, 108], eL: [150, 76], hL: [163, 66], eR: [152, 78], hR: [163, 68], kL: [104, 140], fL: [96, 170], tL: [110, 175], kR: [103, 141], fR: [94, 171], tR: [108, 176] },
    b: { head: [154, 52], neck: [146, 64], pelvis: [119, 109], eL: [146, 84], hL: [163, 66], eR: [148, 86], hR: [163, 68], kL: [105, 140], fL: [96, 170], tL: [110, 175], kR: [104, 141], fR: [94, 171], tR: [108, 176] },
    dur: 2.6,
  },
  "step-touch": {
    view: "front",
    props: [], a: TF,
    b: with_(TF, { head: [112, 30], neck: [112, 48], pelvis: [112, 104], eL: [98, 72], hL: [90, 92], eR: [126, 72], hR: [134, 92], kL: [104, 140], fL: [100, 170], tL: [93, 175], kR: [124, 140], fR: [131, 170], tR: [138, 175] }),
    dur: 1.6,
  },
  "hip-circles": {
    view: "front",
    props: [],
    a: with_(TF, { eL: [80, 86], hL: [91, 102], eR: [120, 86], hR: [109, 102] }),
    b: with_(TF, { pelvis: [107, 103], eL: [86, 86], hL: [98, 101], eR: [126, 86], hR: [116, 101], kL: [97, 140], kR: [109, 140] }),
    deco: [{ kind: "spin", at: [100, 116], r: 9 }], dur: 2.6,
  },
  "mini-squat": {
    props: ["chair-support"], a: TS,
    b: with_(TS, { head: [110, 46], neck: [105, 63], pelvis: [88, 116], kL: [110, 140], kR: [108, 141], eL: [117, 86], eR: [119, 88] }),
    dur: 3,
  },
  "march-arms": {
    props: [],
    a: with_(T, { kL: [119, 122], fL: [115, 156], tL: [128, 158], eL: [88, 76], hL: [82, 98], eR: [112, 72], hR: [124, 88] }),
    b: with_(T, { kR: [119, 122], fR: [115, 156], tR: [128, 158], eR: [88, 76], hR: [82, 98], eL: [112, 72], hL: [124, 88] }),
    dur: 1.2,
  },
  celebrate: {
    view: "front",
    props: [],
    a: with_(TF, { eL: [84, 34], hL: [74, 14], eR: [116, 34], hR: [126, 14] }),
    b: with_(TF, { head: [100, 27], neck: [100, 45], eL: [82, 30], hL: [70, 10], eR: [118, 30], hR: [130, 10] }),
    dur: 1.6,
  },
};

// ── Rendering ────────────────────────────────────────────────────────
// House style: rounded, filled figure in clothing colours. The far-side limbs
// use deeper shades for depth. Every shape is a thick round-capped line or a
// circle, so SMIL can tween the joints exactly as before.

const C = {
  skin: "#E2A57F",
  skinFar: "#C98D69",
  hair: "#27303A",
  shirt: "#2C7658",
  shirtFar: "#215E46",
  pants: "#1D3F3B",
  pantsFar: "#132E2B",
  shoe: "#F7F7F2",
  shoeFar: "#D7DED8",
  prop: "#8EC3A7",
  propDeep: "#6FAE8E",
  shadow: "#153532",
};

type Getter = (p: Pose) => P;
const at = (k: keyof Pose): Getter => (p) => p[k];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Shoulders sit a little below the neck point, so arms don't sprout from the throat. */
const shoulder: Getter = (p) => lerp(p.neck, p.pelvis, 0.13);
const chestTop: Getter = (p) => lerp(p.neck, p.pelvis, 0.06);
const neckTop: Getter = (p) => lerp(p.neck, p.head, 0.55);

type Part = { from: Getter; to: Getter; width: number; color: string };

const shift = (g: Getter, dx: number): Getter => (p) => {
  const [x, y] = g(p);
  return [x + dx, y];
};

/**
 * Side views: limbs share one shoulder/hip point and the far side is shaded deeper.
 * Front views: shoulders and hips get width, and both sides share the same colours.
 */
function makeParts(view: "side" | "front") {
  const front = view === "front";
  const sh = front ? 8.5 : 0;
  const hip = front ? 5 : 0;
  const farC = front
    ? { pants: C.pants, shoe: C.shoe, shirt: C.shirt, skin: C.skin }
    : { pants: C.pantsFar, shoe: C.shoeFar, shirt: C.shirtFar, skin: C.skinFar };
  const far: Part[] = [
    { from: shift(at("pelvis"), -hip), to: at("kL"), width: 13, color: farC.pants },
    { from: at("kL"), to: at("fL"), width: 11, color: farC.pants },
    { from: at("fL"), to: at("tL"), width: 8, color: farC.shoe },
    { from: shift(shoulder, -sh), to: at("eL"), width: 10, color: farC.shirt },
    { from: at("eL"), to: at("hL"), width: 8, color: farC.skin },
  ];
  const body: Part[] = [
    { from: at("neck"), to: neckTop, width: 7, color: C.skin },
    { from: chestTop, to: at("pelvis"), width: front ? 23 : 21, color: C.shirt },
  ];
  const near: Part[] = [
    { from: shift(at("pelvis"), hip), to: at("kR"), width: 13, color: C.pants },
    { from: at("kR"), to: at("fR"), width: 11, color: C.pants },
    { from: at("fR"), to: at("tR"), width: 8, color: C.shoe },
    { from: shift(shoulder, sh), to: at("eR"), width: 10, color: C.shirt },
    { from: at("eR"), to: at("hR"), width: 8, color: C.skin },
  ];
  return { far, body, near, farSkin: farC.skin };
}
const PARTS = { side: makeParts("side"), front: makeParts("front") };

const EASE = "0.45 0 0.55 1;0.45 0 0.55 1";
const r1 = (n: number) => Math.round(n * 10) / 10;

function Anim({ attr, from, to, dur }: { attr: string; from: number; to: number; dur: number }) {
  if (r1(from) === r1(to)) return null;
  return (
    <animate
      attributeName={attr}
      values={`${r1(from)};${r1(to)};${r1(from)}`}
      keyTimes="0;0.5;1"
      calcMode="spline"
      keySplines={EASE}
      dur={`${dur}s`}
      repeatCount="indefinite"
    />
  );
}

function Limb({ part, a, b, dur }: { part: Part; a: Pose; b?: Pose; dur: number }) {
  const [x1, y1] = part.from(a);
  const [x2, y2] = part.to(a);
  const B = b ? [part.from(b), part.to(b)] : null;
  return (
    <line x1={r1(x1)} y1={r1(y1)} x2={r1(x2)} y2={r1(y2)} stroke={part.color} strokeWidth={part.width} strokeLinecap="round">
      {B && (
        <>
          <Anim attr="x1" from={x1} to={B[0][0]} dur={dur} />
          <Anim attr="y1" from={y1} to={B[0][1]} dur={dur} />
          <Anim attr="x2" from={x2} to={B[1][0]} dur={dur} />
          <Anim attr="y2" from={y2} to={B[1][1]} dur={dur} />
        </>
      )}
    </line>
  );
}

function Dot({ get, r, color, a, b, dur }: { get: Getter; r: number; color: string; a: Pose; b?: Pose; dur: number }) {
  const [cx, cy] = get(a);
  const to = b ? get(b) : null;
  return (
    <circle cx={r1(cx)} cy={r1(cy)} r={r} fill={color}>
      {to && (
        <>
          <Anim attr="cx" from={cx} to={to[0]} dur={dur} />
          <Anim attr="cy" from={cy} to={to[1]} dur={dur} />
        </>
      )}
    </circle>
  );
}

/** Head = hair cap + face, moved together so they never drift apart. */
function Head({ a, b, dur }: { a: Pose; b?: Pose; dur: number }) {
  const [hx, hy] = a.head;
  const dx = b ? r1(b.head[0] - hx) : 0;
  const dy = b ? r1(b.head[1] - hy) : 0;
  return (
    <g>
      {b && (dx !== 0 || dy !== 0) && (
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0 0;${dx} ${dy};0 0`}
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines={EASE}
          dur={`${dur}s`}
          repeatCount="indefinite"
        />
      )}
      <circle cx={hx - 1.2} cy={hy - 1.6} r={12.6} fill={C.hair} />
      <circle cx={hx + 0.8} cy={hy + 1.2} r={11} fill={C.skin} />
      <path d={`M ${hx - 10.5} ${hy - 2} Q ${hx - 2} ${hy - 13} ${hx + 9.5} ${hy - 5}`} stroke={C.hair} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Props({ props }: { props: Prop[] }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {props.includes("chair-side") && (
        <g>
          <path d="M70 128 L70 176 M114 128 L114 176" stroke={C.propDeep} strokeWidth={5} />
          <path d="M64 70 L68 122" stroke={C.propDeep} strokeWidth={7} />
          <rect x={60} y={120} width={62} height={10} rx={5} fill={C.prop} />
        </g>
      )}
      {props.includes("chair-front") && (
        <g>
          <rect x={72} y={60} width={56} height={62} rx={14} fill={C.prop} opacity={0.55} />
          <path d="M76 128 L76 176 M124 128 L124 176" stroke={C.propDeep} strokeWidth={5} />
          <rect x={66} y={119} width={68} height={10} rx={5} fill={C.prop} />
        </g>
      )}
      {props.includes("chair-support") && (
        <g>
          <path d="M140 84 L140 176 M174 130 L174 176" stroke={C.propDeep} strokeWidth={6} />
          <rect x={136} y={124} width={42} height={9} rx={4.5} fill={C.prop} />
          <rect x={134} y={80} width={12} height={10} rx={5} fill={C.prop} />
        </g>
      )}
      {props.includes("wall") && <rect x={166} y={14} width={20} height={164} rx={4} fill={C.prop} opacity={0.8} />}
    </g>
  );
}

function DecoLayer({ deco, animated }: { deco: Deco[]; animated: boolean }) {
  return (
    <g fill="none" stroke={C.shirt} strokeLinecap="round">
      {deco.map((d, i) => {
        if (d.kind === "spin") {
          return (
            <path
              key={i}
              d={`M ${d.at[0] + d.r} ${d.at[1]} A ${d.r} ${d.r} 0 1 1 ${d.at[0]} ${d.at[1] - d.r}`}
              strokeWidth={2.5}
              strokeDasharray="3 4"
              opacity={0.75}
            >
              {animated && (
                <animateTransform attributeName="transform" type="rotate" from={`0 ${d.at[0]} ${d.at[1]}`} to={`360 ${d.at[0]} ${d.at[1]}`} dur="2.4s" repeatCount="indefinite" />
              )}
            </path>
          );
        }
        if (d.kind === "pulse") {
          return (
            <circle key={i} cx={d.at[0]} cy={d.at[1]} r={d.r + 3} strokeWidth={2.5} strokeDasharray="2 4" opacity={0.8}>
              {animated && <animate attributeName="r" values={`${d.r + 3};${d.r + 8};${d.r + 3}`} dur="1.6s" repeatCount="indefinite" />}
            </circle>
          );
        }
        return (
          <circle key={i} cx={d.at[0]} cy={d.at[1]} r={22} strokeWidth={3} opacity={0.5}>
            {animated && (
              <>
                <animate attributeName="r" values="18;30;18" dur="8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines={EASE} />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="8s" repeatCount="indefinite" />
              </>
            )}
          </circle>
        );
      })}
    </g>
  );
}

export function MovementIllustration({
  illustrationKey,
  animated = false,
  className,
  title,
}: {
  illustrationKey: string;
  animated?: boolean;
  className?: string;
  /** Provide for standalone use; omit when the exercise name is already adjacent. */
  title?: string;
}) {
  const figure = FIGURES[illustrationKey] ?? FIGURES["breathing"];
  const { a, dur = 2.8 } = figure;
  const b = animated ? figure.b : undefined;
  const footX = (a.fL[0] + a.fR[0]) / 2;
  const parts = PARTS[figure.view ?? "side"];

  return (
    <svg
      viewBox="20 0 170 186"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
    >
      <ellipse cx={footX + 6} cy={178} rx={34} ry={4.5} fill={C.shadow} opacity={0.12} />
      <Props props={figure.props} />
      {figure.deco && <DecoLayer deco={figure.deco} animated={animated} />}
      <g>
        {parts.far.map((part, i) => <Limb key={`f${i}`} part={part} a={a} b={b} dur={dur} />)}
        <Dot get={at("hL")} r={5.2} color={parts.farSkin} a={a} b={b} dur={dur} />
        {parts.body.map((part, i) => <Limb key={`b${i}`} part={part} a={a} b={b} dur={dur} />)}
        {parts.near.map((part, i) => <Limb key={`n${i}`} part={part} a={a} b={b} dur={dur} />)}
        <Dot get={at("hR")} r={5.2} color={C.skin} a={a} b={b} dur={dur} />
        <Head a={a} b={b} dur={dur} />
      </g>
    </svg>
  );
}

export const ILLUSTRATION_KEYS = Object.keys(FIGURES).filter((k) => k !== "celebrate");
