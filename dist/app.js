const STORAGE_KEY = "xiaoao-indeterminate-v1";

const TOPICS = [
  { id: "indeterminate", title: "不定方程", group: "秋季新增" },
  { id: "inclusion", title: "容斥原理", group: "暑期 14 讲" },
  { id: "pigeonhole", title: "抽屉原理", group: "暑期 14 讲" },
  { id: "combinatorics", title: "排列组合", group: "暑期 14 讲" },
  { id: "sequences", title: "数列与数表", group: "暑期 14 讲" },
  { id: "fractions", title: "分数与繁分数", group: "暑期 14 讲" },
  { id: "estimation", title: "比较与估算", group: "暑期 14 讲" },
  { id: "geometry_counting", title: "几何计数", group: "暑期 14 讲" },
  { id: "number_shape", title: "数形结合", group: "暑期 14 讲" },
  { id: "telescoping", title: "裂项", group: "暑期 14 讲" },
  { id: "induction", title: "通项归纳", group: "暑期 14 讲" },
  { id: "triangles", title: "三角形中的模型", group: "暑期 14 讲" },
  { id: "polygons", title: "正多边形与角", group: "暑期 14 讲" },
  { id: "remainders", title: "整除、余数性质", group: "暑期 14 讲" },
  { id: "prime_factors", title: "分解质因数的应用", group: "暑期 14 讲" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const topicTitle = (id) => TOPICS.find((topic) => topic.id === id)?.title || "综合题";

const gcd = (a, b) => {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
};

const factorial = (n) => {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
};

const combination = (n, k) => factorial(n) / (factorial(k) * factorial(n - k));

function fraction(num, den) {
  const divisor = gcd(num, den);
  const reducedNum = num / divisor;
  const reducedDen = den / divisor;
  return {
    value: reducedNum / reducedDen,
    display: reducedDen === 1 ? String(reducedNum) : `${reducedNum}/${reducedDen}`
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const mistakes = Array.isArray(saved.mistakes) ? saved.mistakes.map((item) => ({
      ...item,
      topic: item.topic || "indeterminate",
      answerValue: item.answerValue ?? item.answer
    })) : [];
    return {
      attempts: 0,
      correct: 0,
      streak: 0,
      topicStats: {},
      ...saved,
      mistakes
    };
  } catch {
    return { attempts: 0, correct: 0, streak: 0, topicStats: {}, mistakes: [] };
  }
}

let state = loadState();
let practiceKind = "topic";
let selectedTopic = "indeterminate";
let mixedStrategy = "balanced";
let selectedDifficulty = "random";
let currentProblem = null;
let questionNumber = 0;
let answered = false;
let lastSignature = "";

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderStats();
  renderMistakes();
}

function naturalSolutions(a, b, c, positive = false) {
  const start = positive ? 1 : 0;
  const solutions = [];
  for (let x = start; x <= Math.floor(c / a); x += 1) {
    const rest = c - a * x;
    if (rest >= 0 && rest % b === 0 && rest / b >= start) solutions.push([x, rest / b]);
  }
  return solutions;
}

function makeIndeterminateCount() {
  const pairs = [[3, 5], [4, 7], [5, 8], [5, 6], [6, 7], [7, 9], [4, 9]];
  const positive = Math.random() < 0.45;
  let a, b, c, solutions;
  do {
    [a, b] = randomItem(pairs);
    c = rand(5, 11) * rand(5, 8);
    solutions = naturalSolutions(a, b, c, positive);
  } while (solutions.length < 2 || solutions.length > 6);
  const domain = positive ? "正整数" : "自然数";
  return {
    tag: `${domain}解`,
    context: "先判断取值范围，再有序枚举。",
    prompt: `方程 ${a}x + ${b}y = ${c} 有多少组${domain}解？`,
    answerValue: solutions.length,
    answerDisplay: `${solutions.length} 组`,
    hint: `固定 x 后，${c} − ${a}x 必须是 ${b} 的倍数。`,
    steps: [
      `由 ${a}x ≤ ${c}，先确定 x 的取值范围。`,
      `逐一检查 ${c} − ${a}x 能否被 ${b} 整除。`,
      `符合条件的 (x，y) 为：${solutions.map(([x, y]) => `(${x}，${y})`).join("、")}。`,
      `所以共有 ${solutions.length} 组${domain}解。`
    ]
  };
}

function makeIndeterminateSubtraction() {
  const pairs = [[5, 3], [7, 4], [8, 5], [9, 5], [11, 6], [7, 3]];
  let a, b, c, x0, y0;
  do {
    [a, b] = randomItem(pairs);
    c = a * rand(1, 8) - b * rand(1, 8);
    x0 = undefined;
    y0 = undefined;
    for (let x = 0; x <= 80; x += 1) {
      const rest = a * x - c;
      if (rest >= 0 && rest % b === 0) {
        [x0, y0] = [x, rest / b];
        break;
      }
    }
  } while (c <= 0 || x0 === undefined || x0 + y0 === 0);
  const divisor = gcd(a, b);
  return {
    tag: "减法方程",
    context: "这类方程的自然数解通常有无穷多组。",
    prompt: `方程 ${a}x − ${b}y = ${c} 有无穷多组自然数解。使 x + y 最小的 x + y 是多少？`,
    answerValue: x0 + y0,
    answerDisplay: String(x0 + y0),
    hint: `从较小的 x 开始，使 ${a}x − ${c} 成为 ${b} 的非负倍数。`,
    steps: [
      `移项得 ${b}y = ${a}x − ${c}。`,
      `从小到大尝试 x，最先得到 x = ${x0}、y = ${y0}。`,
      `全部自然数解为 x = ${x0} + ${b / divisor}t，y = ${y0} + ${a / divisor}t（t 为自然数），所以有无穷多组解。`,
      `t = 0 时 x + y 最小，最小值为 ${x0 + y0}。`
    ]
  };
}

function makeIndeterminateApplication() {
  const [itemA, itemB, a, b] = randomItem([
    ["本练习本", "支铅笔", 4, 3],
    ["盒彩笔", "本贴纸", 7, 5],
    ["枚大邮票", "枚小邮票", 8, 3],
    ["个面包", "盒牛奶", 6, 5]
  ]);
  let total, solutions;
  do {
    total = a * rand(2, 8) + b * rand(2, 8);
    solutions = naturalSolutions(a, b, total, true);
  } while (solutions.length < 2 || solutions.length > 6);
  return {
    tag: "生活应用",
    context: `每${itemA}${a}元，每${itemB}${b}元。`,
    prompt: `两种物品都要买，恰好花完 ${total} 元，共有多少种不同的购买方法？`,
    answerValue: solutions.length,
    answerDisplay: `${solutions.length} 种`,
    hint: "设两种物品各买 x、y 个，列出方程，并注意 x、y 都是正整数。",
    steps: [
      `设购买 ${itemA} x 个、${itemB} y 个，列方程 ${a}x + ${b}y = ${total}。`,
      "因为两种物品都要买，所以 x、y 都是正整数。",
      `有序枚举得到：${solutions.map(([x, y]) => `(${x}，${y})`).join("、")}。`,
      `因此共有 ${solutions.length} 种购买方法。`
    ]
  };
}

function makeInclusionProblem() {
  let total, a, b, both, neither;
  do {
    total = rand(38, 52);
    a = rand(20, 31);
    b = rand(18, 29);
    both = rand(7, 15);
    neither = total - (a + b - both);
  } while (neither < 2 || neither > 14);
  return {
    tag: "两量容斥",
    context: `某班有 ${total} 名同学。`,
    prompt: `喜欢数学的有 ${a} 人，喜欢科学的有 ${b} 人，两项都喜欢的有 ${both} 人。两项都不喜欢的有多少人？`,
    answerValue: neither,
    answerDisplay: `${neither} 人`,
    hint: "先求至少喜欢一项的人数，注意两项都喜欢的人被重复计算了一次。",
    steps: [
      `至少喜欢一项的有 ${a} + ${b} − ${both} = ${a + b - both}（人）。`,
      `两项都不喜欢的有 ${total} − ${a + b - both} = ${neither}（人）。`,
      "减去重复计算的一次，是容斥原理的关键。"
    ]
  };
}

function makePigeonholeProblem() {
  const colors = rand(4, 7);
  const target = rand(3, 5);
  const answer = colors * (target - 1) + 1;
  return {
    tag: "最不利原则",
    context: `袋中有 ${colors} 种颜色的玻璃珠，每种都足够多。`,
    prompt: `闭眼取珠，至少取出多少颗，才能保证其中有 ${target} 颗颜色相同？`,
    answerValue: answer,
    answerDisplay: `${answer} 颗`,
    hint: `先考虑最不利情况：每种颜色都只取到 ${target - 1} 颗。`,
    steps: [
      `最不利时，每种颜色先取到 ${target - 1} 颗，还没有 ${target} 颗同色。`,
      `此时共取 ${colors} × ${target - 1} = ${colors * (target - 1)}（颗）。`,
      `再取 1 颗必落入某种颜色，所以至少要取 ${answer} 颗。`
    ]
  };
}

function makeCombinatoricsProblem() {
  const n = rand(6, 9);
  if (Math.random() < 0.5) {
    const answer = n * (n - 1);
    return {
      tag: "有序选择",
      context: `从 ${n} 名候选人中选人担任不同职务。`,
      prompt: "选出 1 名队长和 1 名副队长，共有多少种不同的选法？",
      answerValue: answer,
      answerDisplay: `${answer} 种`,
      hint: "两个职务不同，交换人选会得到另一种选法。",
      steps: [`队长有 ${n} 种选法。`, `队长确定后，副队长还有 ${n - 1} 种选法。`, `共有 ${n} × ${n - 1} = ${answer} 种。`]
    };
  }
  const answer = combination(n, 3);
  return {
    tag: "无序选择",
    context: `书架上有 ${n} 本各不相同的故事书。`,
    prompt: "任意选出 3 本带走阅读，共有多少种选法？",
    answerValue: answer,
    answerDisplay: `${answer} 种`,
    hint: "先按顺序选 3 本，再除去同一组书的重复排列。",
    steps: [`按顺序选有 ${n} × ${n - 1} × ${n - 2} 种。`, "同一组 3 本书被重复计算了 6 次。", `共有 ${n} × ${n - 1} × ${n - 2} ÷ 6 = ${answer} 种。`]
  };
}

function makeSequenceProblem() {
  const first = rand(2, 9);
  const difference = rand(3, 7);
  const n = rand(12, 20);
  const last = first + (n - 1) * difference;
  const answer = n * (first + last) / 2;
  return {
    tag: "等差数列",
    context: `观察数列：${first}，${first + difference}，${first + 2 * difference}，${first + 3 * difference}，…`,
    prompt: `这个数列前 ${n} 项的和是多少？`,
    answerValue: answer,
    answerDisplay: String(answer),
    hint: "先求第 n 项，再用“首项加末项，乘项数，除以 2”。",
    steps: [`第 ${n} 项是 ${first} + (${n} − 1) × ${difference} = ${last}。`, `前 ${n} 项的和为 (${first} + ${last}) × ${n} ÷ 2。`, `计算得到 ${answer}。`]
  };
}

function makeFractionProblem() {
  const [a, b] = randomItem([[2, 6], [3, 6], [4, 12], [5, 20], [6, 12], [8, 24], [10, 15]]);
  const result = fraction(a * b, a + b);
  return {
    tag: "繁分数",
    context: "先把分母中的分数加法算清楚。",
    prompt: `计算 1 ÷ (1/${a} + 1/${b}) 的值。`,
    answerValue: result.value,
    answerDisplay: result.display,
    hint: `先算 1/${a} + 1/${b}，再用 1 除以所得结果。`,
    steps: [`1/${a} + 1/${b} = ${a + b}/${a * b}。`, `所以 1 ÷ (${a + b}/${a * b}) = ${a * b}/${a + b}。`, `约分后得到 ${result.display}。`]
  };
}

function makeEstimationProblem() {
  let a, b, c, d;
  do {
    b = rand(9, 20);
    d = rand(9, 20);
    a = rand(2, b - 1);
    c = rand(2, d - 1);
  } while (a * d === c * b);
  const winner = a * d > c * b ? [a, b] : [c, d];
  return {
    tag: "分数比较",
    context: `比较 ${a}/${b} 与 ${c}/${d}，不必化成小数。`,
    prompt: "较大的那个分数，其分子与分母之和是多少？",
    answerValue: winner[0] + winner[1],
    answerDisplay: String(winner[0] + winner[1]),
    hint: `交叉相乘，比较 ${a} × ${d} 与 ${c} × ${b}。`,
    steps: [`${a} × ${d} = ${a * d}，${c} × ${b} = ${c * b}。`, `所以较大的分数是 ${winner[0]}/${winner[1]}。`, `分子与分母之和为 ${winner[0]} + ${winner[1]} = ${winner[0] + winner[1]}。`]
  };
}

function makeGeometryCountingProblem() {
  const columns = rand(3, 6);
  const rows = rand(3, 5);
  let total = 0;
  const counts = [];
  for (let size = 1; size <= Math.min(columns, rows); size += 1) {
    const count = (columns - size + 1) * (rows - size + 1);
    total += count;
    counts.push({ size, count });
  }
  return {
    tag: "方格计数",
    context: `一个长方形网格横向有 ${columns} 个小方格，纵向有 ${rows} 个小方格。`,
    prompt: "图中一共能数出多少个大小不同的正方形？",
    answerValue: total,
    answerDisplay: `${total} 个`,
    hint: "按边长为 1、2、3……的小正方形分类统计。",
    steps: [`分类统计：${counts.map(({ size, count }) => `${size}×${size} 的有 ${count} 个`).join("；")}。`, `把各类相加：${counts.map(({ count }) => count).join(" + ")} = ${total}。`, "边长不能超过网格较短的一边。"]
  };
}

function makeNumberShapeProblem() {
  const n = rand(10, 20);
  const answer = n * (n + 1) / 2;
  return {
    tag: "三角数",
    context: "按第 1 行 1 个、第 2 行 2 个……排成三角形点阵。",
    prompt: `排到第 ${n} 行时，点阵中一共有多少个点？`,
    answerValue: answer,
    answerDisplay: `${answer} 个`,
    hint: `所求是 1 + 2 + 3 + … + ${n}，可以首尾配对。`,
    steps: [`总数为 1 + 2 + 3 + … + ${n}。`, `首尾配对，每对的和是 ${n + 1}。`, `总数是 ${n} × ${n + 1} ÷ 2 = ${answer}。`]
  };
}

function makeTelescopingProblem() {
  const n = rand(6, 12);
  const result = fraction(n, n + 1);
  return {
    tag: "裂项相消",
    context: "观察每一项的分母都是两个连续自然数的乘积。",
    prompt: `计算 1/(1×2) + 1/(2×3) + 1/(3×4) + … + 1/(${n}×${n + 1})。`,
    answerValue: result.value,
    answerDisplay: result.display,
    hint: "利用 1/[k(k+1)] = 1/k − 1/(k+1)。",
    steps: ["各项依次拆成 1 − 1/2，1/2 − 1/3，1/3 − 1/4，……。", `中间项全部相消，只剩 1 − 1/${n + 1}。`, `结果为 ${n}/${n + 1}，即 ${result.display}。`]
  };
}

function makeInductionProblem() {
  const n = rand(12, 30);
  const answer = 3 * n + 1;
  return {
    tag: "找规律求通项",
    context: "用火柴棒横向连续拼正方形：第 1 个用 4 根，以后每增加 1 个正方形只增加 3 根。",
    prompt: `连续拼出 ${n} 个正方形，一共需要多少根火柴棒？`,
    answerValue: answer,
    answerDisplay: `${answer} 根`,
    hint: "第一个正方形单独算，后面的每个都与前一个共用一条边。",
    steps: ["第 1 个正方形需要 4 根。", `后面 ${n - 1} 个正方形各增加 3 根。`, `总数为 4 + (${n} − 1) × 3 = ${answer}（根）。`]
  };
}

function makeTriangleProblem() {
  const ratio = rand(2, 6);
  const smallArea = rand(6, 24);
  const answer = ratio * smallArea;
  return {
    tag: "等高三角形",
    context: "两个三角形的高相等。",
    prompt: `大三角形的底是小三角形底的 ${ratio} 倍，小三角形面积是 ${smallArea} 平方厘米。大三角形面积是多少平方厘米？`,
    answerValue: answer,
    answerDisplay: `${answer} 平方厘米`,
    hint: "等高三角形的面积比等于底边之比。",
    steps: ["三角形面积 = 底 × 高 ÷ 2。", `两者高相同，所以面积比就是底边比 ${ratio}:1。`, `大三角形面积为 ${smallArea} × ${ratio} = ${answer}（平方厘米）。`]
  };
}

function makePolygonProblem() {
  const n = randomItem([5, 6, 8, 9, 10, 12]);
  if (Math.random() < 0.5) {
    const answer = (n - 2) * 180;
    return {
      tag: "内角和",
      context: `研究一个 ${n} 边形。`,
      prompt: "它的内角和是多少度？",
      answerValue: answer,
      answerDisplay: `${answer}°`,
      hint: `从一个顶点出发，可以把 ${n} 边形分成 ${n - 2} 个三角形。`,
      steps: [`可分成 ${n} − 2 = ${n - 2} 个三角形。`, `内角和为 (${n} − 2) × 180° = ${answer}°。`, "这个方法适用于任意凸多边形。"]
    };
  }
  const answer = (n - 2) * 180 / n;
  return {
    tag: "正多边形内角",
    context: `一个正 ${n} 边形的各个内角都相等。`,
    prompt: "它的每个内角是多少度？",
    answerValue: answer,
    answerDisplay: `${answer}°`,
    hint: "先求内角和，再平均分成 n 份。",
    steps: [`内角和为 (${n} − 2) × 180° = ${(n - 2) * 180}°。`, `每个内角为 ${(n - 2) * 180}° ÷ ${n}。`, `计算得到 ${answer}°。`]
  };
}

function makeRemainderProblem() {
  const divisor = rand(6, 13);
  const remainder = rand(1, divisor - 1);
  const multiplier = rand(3, 9);
  const addend = rand(2, 18);
  const answer = (multiplier * remainder + addend) % divisor;
  return {
    tag: "余数性质",
    context: `自然数 N 除以 ${divisor} 余 ${remainder}。`,
    prompt: `${multiplier}N + ${addend} 除以 ${divisor}，余数是多少？`,
    answerValue: answer,
    answerDisplay: String(answer),
    hint: `用 N 的余数代替 N，计算 ${multiplier} × ${remainder} + ${addend} 的余数。`,
    steps: [`${multiplier}N + ${addend} 与 ${multiplier} × ${remainder} + ${addend} 的余数相同。`, `${multiplier} × ${remainder} + ${addend} = ${multiplier * remainder + addend}。`, `${multiplier * remainder + addend} 除以 ${divisor} 余 ${answer}。`]
  };
}

function makePrimeFactorProblem() {
  const [p, q] = randomItem([[2, 3], [2, 5], [3, 5], [2, 7]]);
  const a = rand(2, 4);
  const b = rand(1, 3);
  const number = p ** a * q ** b;
  const answer = (a + 1) * (b + 1);
  return {
    tag: "约数个数",
    context: `${number} = ${p}^${a} × ${q}^${b}。`,
    prompt: `${number} 一共有多少个正约数？`,
    answerValue: answer,
    answerDisplay: `${answer} 个`,
    hint: `质因数 ${p} 的指数可从 0 到 ${a}，质因数 ${q} 的指数可从 0 到 ${b}。`,
    steps: [`质因数 ${p} 的指数有 ${a + 1} 种选择。`, `质因数 ${q} 的指数有 ${b + 1} 种选择。`, `正约数共有 (${a} + 1) × (${b} + 1) = ${answer} 个。`]
  };
}

const DIFFICULTY_LABELS = {
  1: "简单题",
  2: "一般题",
  3: "较难题",
  4: "极难题",
  5: "竞赛压轴题"
};

function buildProblem(tag, context, prompt, answerValue, answerDisplay, hint, steps) {
  return { tag, context, prompt, answerValue, answerDisplay, hint, steps };
}

function rational(num, den = 1) {
  const sign = den < 0 ? -1 : 1;
  const divisor = gcd(Math.abs(num), Math.abs(den));
  return { num: sign * num / divisor, den: Math.abs(den) / divisor };
}

function addRational(left, right) {
  return rational(left.num * right.den + right.num * left.den, left.den * right.den);
}

function rationalDisplay(value) {
  return value.den === 1 ? String(value.num) : `${value.num}/${value.den}`;
}

function makeEasyProblem(topic) {
  switch (topic) {
    case "indeterminate": {
      const k = rand(2, 5);
      const total = 6 * k;
      const solutions = naturalSolutions(2, 3, total);
      return buildProblem("基础枚举", "从 x = 0 开始有序尝试。", `方程 2x + 3y = ${total} 有多少组自然数解？`, solutions.length, `${solutions.length} 组`, "先看 x 取哪些值时，余数能被 3 整除。", [`依次尝试 x = 0，1，2，……，${total / 2}。`, `自然数解为 ${solutions.map(([x, y]) => `(${x}，${y})`).join("、")}。`, `共有 ${solutions.length} 组。`]);
    }
    case "inclusion": {
      const both = rand(3, 7), a = rand(12, 18), b = rand(11, 17);
      const answer = a + b - both;
      return buildProblem("基础容斥", "两类中有一部分重复。", `参加绘画组的有 ${a} 人，参加书法组的有 ${b} 人，两组都参加的有 ${both} 人。至少参加一组的有多少人？`, answer, `${answer} 人`, "两组人数相加后，要减去重复的一次。", [`先算 ${a} + ${b} = ${a + b}。`, `两组都参加的 ${both} 人被算了两次。`, `至少参加一组的有 ${a + b} − ${both} = ${answer} 人。`]);
    }
    case "pigeonhole": {
      const colors = rand(3, 6), answer = colors + 1;
      return buildProblem("同色保证", `盒中有 ${colors} 种颜色的球。`, "至少取出多少个球，才能保证有两个球颜色相同？", answer, `${answer} 个`, "最不利时，先把每种颜色各取到一个。", [`前 ${colors} 个球可能颜色各不相同。`, `再取 1 个，一定与前面的某个球同色。`, `所以至少取 ${colors} + 1 = ${answer} 个。`]);
    }
    case "combinatorics": {
      const a = rand(3, 6), b = rand(3, 6), answer = a * b;
      return buildProblem("乘法原理", `有 ${a} 件上衣和 ${b} 条裤子。`, "一件上衣搭配一条裤子，共有多少种搭配？", answer, `${answer} 种`, "每件上衣都可以分别搭配所有裤子。", [`选上衣有 ${a} 种。`, `每种上衣都有 ${b} 种裤子可配。`, `共有 ${a} × ${b} = ${answer} 种。`]);
    }
    case "sequences": {
      const first = rand(1, 8), d = rand(2, 5), n = rand(6, 10), answer = first + (n - 1) * d;
      return buildProblem("等差数列", `数列为 ${first}，${first + d}，${first + 2 * d}，……`, `第 ${n} 项是多少？`, answer, String(answer), "从第 1 项到第 n 项，共增加 n−1 次。", [`相邻两项相差 ${d}。`, `第 ${n} 项为 ${first} + (${n} − 1) × ${d}。`, `计算得到 ${answer}。`]);
    }
    case "fractions": {
      const d = randomItem([6, 8, 10, 12]), a = rand(1, Math.floor(d / 2)), b = rand(1, Math.floor(d / 2));
      const result = rational(a + b, d);
      return buildProblem("同分母加法", "分母相同，分子直接相加。", `计算 ${a}/${d} + ${b}/${d}。`, result.num / result.den, rationalDisplay(result), "分母不变，分子相加，最后约分。", [`${a}/${d} + ${b}/${d} = ${a + b}/${d}。`, `把 ${a + b}/${d} 约分。`, `结果为 ${rationalDisplay(result)}。`]);
    }
    case "estimation": {
      const d = rand(9, 16), a = rand(2, d - 3), b = rand(a + 1, d - 1), answer = b + d;
      return buildProblem("同分母比较", `比较 ${a}/${d} 与 ${b}/${d}。`, "较大分数的分子与分母之和是多少？", answer, String(answer), "分母相同，只比较分子。", [`两个分数的分母都是 ${d}。`, `因为 ${b} > ${a}，所以 ${b}/${d} 较大。`, `分子与分母之和为 ${b} + ${d} = ${answer}。`]);
    }
    case "geometry_counting": {
      const n = rand(2, 5), answer = 3 * n - 1;
      return buildProblem("简单方格计数", `一个网格横向有 ${n} 个小方格，纵向有 2 个小方格。`, "图中一共有多少个正方形？", answer, `${answer} 个`, "分别数边长为 1 和边长为 2 的正方形。", [`1×1 正方形有 ${2 * n} 个。`, `2×2 正方形有 ${n - 1} 个。`, `共有 ${2 * n} + ${n - 1} = ${answer} 个。`]);
    }
    case "number_shape": {
      const n = rand(5, 9), answer = n * (n + 1) / 2;
      return buildProblem("三角数", "点阵每一行依次增加 1 个点。", `第 1 行 1 个点，第 2 行 2 个点，排到第 ${n} 行共有多少个点？`, answer, `${answer} 个`, `计算 1 + 2 + … + ${n}。`, [`总数为 1 + 2 + … + ${n}。`, `用公式 ${n} × ${n + 1} ÷ 2。`, `得到 ${answer} 个。`]);
    }
    case "telescoping": {
      const n = rand(3, 6), result = fraction(n, n + 1);
      return buildProblem("初步裂项", "相邻分数可以前后相消。", `计算 1/(1×2) + 1/(2×3) + … + 1/(${n}×${n + 1})。`, result.value, result.display, "把 1/[k(k+1)] 拆成 1/k−1/(k+1)。", ["各项裂成两个单位分数之差。", `中间项相消，只剩 1 − 1/${n + 1}。`, `结果为 ${result.display}。`]);
    }
    case "induction": {
      const n = rand(3, 7), answer = 3 * n + 1;
      return buildProblem("火柴棒规律", "横向连续拼正方形，每增加一个只增加 3 根。", `拼 ${n} 个正方形需要多少根火柴棒？`, answer, `${answer} 根`, "第一个用 4 根，后面每个加 3 根。", [`第一个用 4 根。`, `后面 ${n - 1} 个各增加 3 根。`, `共 4 + ${n - 1} × 3 = ${answer} 根。`]);
    }
    case "triangles": {
      const base = rand(4, 12), height = rand(3, 10) * 2, answer = base * height / 2;
      return buildProblem("面积公式", "已知三角形的底和高。", `底为 ${base} 厘米、高为 ${height} 厘米的三角形，面积是多少平方厘米？`, answer, `${answer} 平方厘米`, "三角形面积 = 底×高÷2。", [`代入公式 ${base} × ${height} ÷ 2。`, `先算 ${height} ÷ 2 = ${height / 2}。`, `面积为 ${answer} 平方厘米。`]);
    }
    case "polygons": {
      const n = randomItem([3, 4, 5]), answer = (n - 2) * 180;
      return buildProblem("内角和", `研究一个 ${n} 边形。`, "它的内角和是多少度？", answer, `${answer}°`, "n 边形的内角和是 (n−2)×180°。", [`可把它分成 ${n - 2} 个三角形。`, `内角和为 (${n}−2)×180°。`, `结果是 ${answer}°。`]);
    }
    case "remainders": {
      const d = rand(5, 10), r = rand(1, d - 2), add = rand(1, d), answer = (r + add) % d;
      return buildProblem("余数加法", `N 除以 ${d} 余 ${r}。`, `N + ${add} 除以 ${d} 余多少？`, answer, String(answer), `计算 ${r} + ${add} 再除以 ${d} 取余数。`, [`N 可以看成 ${d} 的倍数加 ${r}。`, `只需计算 ${r} + ${add} = ${r + add}。`, `它除以 ${d} 余 ${answer}。`]);
    }
    default: {
      const p = randomItem([2, 3, 5]), q = randomItem([7, 11, 13]), number = p * q;
      return buildProblem("质因数", `${number} = ${p} × ${q}。`, `${number} 的最大质因数是多少？`, Math.max(p, q), String(Math.max(p, q)), "先把这个数分解成质因数的乘积。", [`${number} = ${p} × ${q}。`, `${p} 和 ${q} 都是质数。`, `最大质因数是 ${Math.max(p, q)}。`]);
    }
  }
}

function makeThreeSetProblem(level) {
  const onlyA = rand(5, 11), onlyB = rand(5, 11), onlyC = rand(5, 11);
  const ab = rand(2, 6), ac = rand(2, 6), bc = rand(2, 6), abc = rand(1, 4), none = rand(2, 7);
  const a = onlyA + ab + ac + abc, b = onlyB + ab + bc + abc, c = onlyC + ac + bc + abc;
  const pairAB = ab + abc, pairAC = ac + abc, pairBC = bc + abc;
  const atLeast = onlyA + onlyB + onlyC + ab + ac + bc + abc;
  const exactlyTwo = ab + ac + bc, exactlyOne = onlyA + onlyB + onlyC, total = atLeast + none;
  const facts = `A类有 ${a} 人，B类有 ${b} 人，C类有 ${c} 人；A、B两类都有 ${pairAB} 人，A、C都有 ${pairAC} 人，B、C都有 ${pairBC} 人；三类都有 ${abc} 人`;
  if (level === 3) return buildProblem("三量容斥", `共有 ${total} 人，${facts}。`, "至少属于一类的有多少人？", atLeast, `${atLeast} 人`, "三类人数相加，减去三个两两交集，再加回三类交集。", [`三类人数和为 ${a + b + c}。`, `三个两两交集和为 ${pairAB + pairAC + pairBC}。`, `至少一类：${a + b + c}−${pairAB + pairAC + pairBC}+${abc}=${atLeast}。`]);
  if (level === 4) return buildProblem("恰好两类", facts + "。", "恰好属于两类的有多少人？", exactlyTwo, `${exactlyTwo} 人`, "三个两两交集中，三类都有的人被算了 3 次。", [`两两交集相加为 ${pairAB + pairAC + pairBC}。`, `三类都有的 ${abc} 人在其中被算了 3 次，应全部去掉。`, `恰好两类：${pairAB + pairAC + pairBC}−3×${abc}=${exactlyTwo}。`]);
  return buildProblem("三量容斥综合", `共有 ${total} 人，${facts}。`, "恰好属于一类的人比三类都不属于的人多多少？", exactlyOne - none, `${exactlyOne - none} 人`, "先用三量容斥求恰好一类，再由总人数求三类都不属于的人。", [`恰好一类 = (${a}+${b}+${c})−2×(${pairAB}+${pairAC}+${pairBC})+3×${abc}=${exactlyOne}。`, `至少一类有 ${atLeast} 人，所以三类都不属于的有 ${total}−${atLeast}=${none} 人。`, `两者相差 ${exactlyOne}−${none}=${exactlyOne - none} 人。`]);
}

function makeAdvancedProblem(topic, level) {
  switch (topic) {
    case "indeterminate": {
      if (level === 3) return makeIndeterminateApplication();
      if (level === 4) return makeIndeterminateSubtraction();
      let a, b, total, candidates;
      do {
        [a, b] = randomItem([[7, 11], [8, 13], [9, 14]]);
        total = rand(16, 24) * rand(8, 12);
        candidates = naturalSolutions(a, b, total, true).filter(([x, y]) => x > y && (x + y) % 3 === 0);
      } while (candidates.length < 1);
      const best = candidates.reduce((max, item) => item[0] > max[0] ? item : max);
      return buildProblem("多条件不定方程", "x、y 均为正整数。", `已知 ${a}x + ${b}y = ${total}，且 x > y、x + y 是 3 的倍数。满足条件的解中，x 的最大值是多少？`, best[0], String(best[0]), "先求正整数解，再用两个附加条件筛选。", [`有序枚举方程的正整数解。`, `筛出 x>y 且 x+y 能被 3 整除的解：${candidates.map(([x, y]) => `(${x}，${y})`).join("、")}。`, `其中 x 的最大值是 ${best[0]}。`]);
    }
    case "inclusion": return makeThreeSetProblem(level);
    case "pigeonhole": {
      if (level === 3) {
        const d = rand(5, 9), k = rand(3, 5), answer = d * (k - 1) + 1;
        return buildProblem("余数抽屉", "把整数按除以 d 的余数分类。", `任取多少个整数，才能保证至少有 ${k} 个整数除以 ${d} 的余数相同？`, answer, `${answer} 个`, `除以 ${d} 只有 ${d} 种余数。`, [`共有 ${d} 个余数抽屉。`, `最不利时每个抽屉先放 ${k - 1} 个，共 ${d * (k - 1)} 个。`, `再取 1 个即可保证，答案为 ${answer}。`]);
      }
      const n = rand(8, 15), answer = n + 1;
      const kind = level === 4 ? "和为定值" : "差为定值";
      const prompt = level === 4 ? `从 1，2，…，${2 * n} 中至少选出多少个不同的数，才能保证其中两个数的和为 ${2 * n + 1}？` : `从 1，2，…，${2 * n} 中至少选出多少个不同的数，才能保证其中两个数的差为 ${n}？`;
      return buildProblem(kind, "先把可能配成一对的数放进同一个抽屉。", prompt, answer, `${answer} 个`, `这些数恰好可以分成 ${n} 个互不重叠的配对。`, [`把 1 到 ${2 * n} 分成 ${n} 对符合条件的数。`, `最多可从每对只选 1 个而不出现目标数对，共选 ${n} 个。`, `再选 1 个必与已选数配对，所以至少选 ${answer} 个。`]);
    }
    case "combinatorics": {
      const n = rand(6, 8);
      if (level === 3) {
        const answer = factorial(n) - 2 * factorial(n - 1);
        return buildProblem("不相邻排列", `${n} 名同学排成一排。`, "甲、乙两人不相邻，共有多少种排法？", answer, `${answer} 种`, "用全部排法减去甲乙相邻的排法。", [`全部有 ${n}! = ${factorial(n)} 种。`, `甲乙相邻时捆成一组，有 2×${n - 1}! = ${2 * factorial(n - 1)} 种。`, `不相邻有 ${factorial(n)}−${2 * factorial(n - 1)}=${answer} 种。`]);
      }
      if (level === 4) {
        const answer = 2 * factorial(n - 2);
        return buildProblem("圆排列", `${n} 名同学围坐圆桌。`, "甲、乙必须相邻，共有多少种不同坐法？（旋转后重合视为同一种）", answer, `${answer} 种`, "把甲乙捆成一个整体，再做圆排列。", [`甲乙内部有 2 种顺序。`, `捆绑后共有 ${n - 1} 个整体，圆排列有 (${n - 2})! 种。`, `共有 2×${n - 2}!=${answer} 种。`]);
      }
      const answer = 2 * factorial(n - 1) - 4 * factorial(n - 2);
      return buildProblem("复合限制排列", `${n} 名同学排成一排，其中甲、乙、丙、丁互不相同。`, "要求丙、丁相邻，但甲、乙不相邻，共有多少种排法？", answer, `${answer} 种`, "先算丙丁相邻，再减去甲乙也相邻的情况。", [`丙丁相邻有 2×${n - 1}!=${2 * factorial(n - 1)} 种。`, `两对都相邻有 2×2×${n - 2}!=${4 * factorial(n - 2)} 种。`, `相减得到 ${answer} 种。`]);
    }
    case "sequences": {
      const n = rand(10, 18);
      if (level === 3) {
        const c = rand(1, 5), answer = n * n + n + c;
        return buildProblem("二级等差", `数列第 k 项满足“k²+k+${c}”的规律，前几项为 ${2 + c}，${6 + c}，${12 + c}，${20 + c}，…`, `第 ${n} 项是多少？`, answer, String(answer), "先观察相邻差，再观察差的差。", ["相邻差依次增加 2，是二级等差数列。", `通项可写为 k²+k+${c}。`, `代入 k=${n}，得到 ${answer}。`]);
      }
      if (level === 4) {
        const start = rand(1, 3), answer = (start + 1) * 2 ** (n - 1) - 1;
        return buildProblem("递推数列", `a₁=${start}，且 aₙ₊₁=2aₙ+1。`, `a${n} 等于多少？`, answer, String(answer), "给每一项加 1，递推关系会变成连续乘 2。", [`令 bₙ=aₙ+1，则 bₙ₊₁=2bₙ。`, `b₁=${start + 1}，所以 b${n}=${start + 1}×2^${n - 1}。`, `a${n}=b${n}−1=${answer}。`]);
      }
      const answer = n * (n + 1) * (2 * n + 1) / 6;
      return buildProblem("平方和归纳", "平方数列为 1，4，9，16，……", `1²+2²+3²+…+${n}² 的和是多少？`, answer, String(answer), "使用平方和通项 n(n+1)(2n+1)/6，并检查因数配对。", [`平方和公式为 n(n+1)(2n+1)/6。`, `代入 n=${n}：${n}×${n + 1}×${2 * n + 1}÷6。`, `结果为 ${answer}。`]);
    }
    case "fractions": {
      const a = rand(3, 6), b = rand(2, 6), c = rand(2, 8);
      if (level === 3) {
        const result = rational(b, a * b + 1);
        return buildProblem("二层繁分数", "先算括号，再取倒数。", `计算 1 ÷ (${a} + 1/${b})。`, result.num / result.den, rationalDisplay(result), "把括号内通分，再把所得分数取倒数。", [`${a}+1/${b}=${a * b + 1}/${b}。`, `1 除以 ${a * b + 1}/${b}，就是取它的倒数。`, `结果为 ${rationalDisplay(result)}。`]);
      }
      const inner = rational(b * c + 1, c);
      const middle = rational(a * inner.num + inner.den, inner.num);
      const result = rational(middle.den, middle.num);
      if (level === 4) return buildProblem("连环繁分数", "连续取倒数时要保持运算顺序。", `计算 1 ÷ (${a} + 1 ÷ (${b} + 1/${c}))。`, result.num / result.den, rationalDisplay(result), "由内向外逐层化简。", [`最内层 ${b}+1/${c}=${inner.num}/${inner.den}。`, `再算 ${a}+${inner.den}/${inner.num}=${middle.num}/${middle.den}。`, `最后取倒数，结果为 ${rationalDisplay(result)}。`]);
      const p = rand(2, 5), q = rand(2, 6), target = rational(q, p), x = addRational(target, rational(-1, a));
      return buildProblem("分数方程", "未知数藏在繁分数的分母中。", `若 1 ÷ (x + 1/${a}) = ${p}/${q}，求 x。`, x.num / x.den, rationalDisplay(x), "先对等式两边取倒数，再移项。", [`x+1/${a}=${q}/${p}。`, `所以 x=${q}/${p}−1/${a}。`, `通分约分后 x=${rationalDisplay(x)}。`]);
    }
    case "estimation": {
      let a, b, c, d;
      if (level === 3) [a, b, c, d] = [rand(80, 140), 0, 0, 0], b = a + 1, c = a + 1, d = a + 2;
      else if (level === 4) [a, b, c, d] = [rand(300, 800), 0, 0, 0], b = a + 3, c = a - 1, d = a + 1;
      else [a, b, c, d] = [rand(900, 1600), 0, 0, 0], b = a + 7, c = a - 2, d = a + 4;
      const firstLarger = a * d > c * b, winner = firstLarger ? [a, b] : [c, d], answer = winner[0] + winner[1];
      return buildProblem(level === 5 ? "大数精细比较" : "差量比较", `比较 ${a}/${b} 与 ${c}/${d}。`, "较大分数的分子与分母之和是多少？", answer, String(answer), "都接近 1 时，可比较它们距离 1 还差多少。", [`交叉乘积为 ${a}×${d}=${a * d} 与 ${c}×${b}=${c * b}。`, `较大的分数是 ${winner[0]}/${winner[1]}。`, `分子与分母之和是 ${answer}。`]);
    }
    case "geometry_counting": {
      const m = rand(4, 7), n = rand(3, 6), rectangles = combination(m + 1, 2) * combination(n + 1, 2);
      let squares = 0;
      for (let k = 1; k <= Math.min(m, n); k += 1) squares += (m - k + 1) * (n - k + 1);
      if (level === 3) return buildProblem("长方形计数", `网格横向 ${m} 格、纵向 ${n} 格。`, "一共有多少个长方形（正方形也算）？", rectangles, `${rectangles} 个`, "分别选择两条竖线和两条横线。", [`竖线有 ${m + 1} 条，选两条有 ${combination(m + 1, 2)} 种。`, `横线有 ${n + 1} 条，选两条有 ${combination(n + 1, 2)} 种。`, `共有 ${rectangles} 个长方形。`]);
      if (level === 4) return buildProblem("非正方形计数", `网格横向 ${m} 格、纵向 ${n} 格。`, "一共有多少个不是正方形的长方形？", rectangles - squares, `${rectangles - squares} 个`, "先数全部长方形，再减去所有正方形。", [`全部长方形有 ${rectangles} 个。`, `分类数正方形，共 ${squares} 个。`, `非正方形长方形有 ${rectangles}−${squares}=${rectangles - squares} 个。`]);
      const col = rand(2, m - 1), row = rand(2, n - 1), answer = col * (m - col + 1) * row * (n - row + 1);
      return buildProblem("含定点长方形", `网格横向 ${m} 格、纵向 ${n} 格，从左数第 ${col} 列、从上数第 ${row} 行的小方格被标记。`, "有多少个长方形包含这个被标记的小方格？", answer, `${answer} 个`, "分别选择标记格左、右、上、下的边界。", [`左边界有 ${col} 种、右边界有 ${m - col + 1} 种。`, `上边界有 ${row} 种、下边界有 ${n - row + 1} 种。`, `共有 ${col}×${m - col + 1}×${row}×${n - row + 1}=${answer} 个。`]);
    }
    case "number_shape": {
      const n = rand(8, 16);
      if (level === 3) {
        const answer = 4 * n - 4;
        return buildProblem("方阵边界", `一个方阵每边有 ${n} 个点。`, "只数最外圈，一共有多少个点？", answer, `${answer} 个`, "四条边相加后，四个顶点各重复一次。", [`四边共有 ${4 * n} 个点次。`, "四个顶点都被数了两次，各减去一次。", `外圈共有 4×${n}−4=${answer} 个点。`]);
      }
      if (level === 4) {
        const answer = n * (n + 1) * (n + 2) / 6;
        return buildProblem("立体三角数", `第 1 层放 1 个球，第 2 层放 1+2 个，第 3 层放 1+2+3 个，依此类推。`, `叠到第 ${n} 层一共有多少个球？`, answer, `${answer} 个`, "这是前 n 个三角数的和。", [`第 k 层有 k(k+1)/2 个球。`, `前 n 个三角数之和为 n(n+1)(n+2)/6。`, `代入 ${n} 得 ${answer} 个。`]);
      }
      const answer = 3 * n * (n - 1) + 1;
      return buildProblem("中心六边形数", "第 1 层中心有 1 个点，以后每层外围依次增加 6、12、18……个点。", `画到第 ${n} 层时共有多少个点？`, answer, `${answer} 个`, "外围增加数是 6×(1+2+…+n−1)。", [`外围共有 6×(1+2+…+${n - 1}) 个点。`, `等于 6×${n - 1}×${n}÷2=${3 * n * (n - 1)}。`, `再加中心 1 个，共 ${answer} 个。`]);
    }
    case "telescoping": {
      const n = rand(6, 12);
      let result = rational(0, 1), terms = [];
      const step = level === 3 ? 2 : level === 4 ? 3 : null;
      if (step) {
        for (let k = 1; k <= n; k += 1) {
          result = addRational(result, rational(1, k * (k + step)));
          terms.push(`1/(${k}×${k + step})`);
        }
        return buildProblem(`${step}步裂项`, "分母两因数相差固定步长。", `计算 ${terms.slice(0, 3).join(" + ")} + … + 1/(${n}×${n + step})。`, result.num / result.den, rationalDisplay(result), `利用 1/[k(k+${step})]=[1/k−1/(k+${step})]/${step}。`, [`按相差 ${step} 的形式裂项。`, "把正负单位分数按同类项相消。", `剩余项通分后得到 ${rationalDisplay(result)}。`]);
      }
      for (let k = 1; k <= n; k += 1) result = addRational(result, rational(1, k * (k + 1) * (k + 2)));
      return buildProblem("三因式裂项", "每项分母含三个连续因数。", `计算 1/(1×2×3)+1/(2×3×4)+…+1/(${n}×${n + 1}×${n + 2})。`, result.num / result.den, rationalDisplay(result), "先拆成相邻两个二因式分数之差，再乘 1/2。", ["1/[k(k+1)(k+2)]=½[1/(k(k+1))−1/((k+1)(k+2))]。", "首尾相消后只剩首项的一半与末项的一半。", `化简得到 ${rationalDisplay(result)}。`]);
    }
    case "induction": {
      const n = rand(6, 14);
      if (level === 3) {
        const answer = 4 * n - 4;
        return buildProblem("空心方阵通项", `用棋子摆空心正方形，每边 ${n} 枚。`, "最外圈一共需要多少枚棋子？", answer, `${answer} 枚`, "四边相加后减去重复的四个角。", [`四边共 ${4 * n} 枚次。`, "四个角各重复一次。", `通项为 4n−4，代入得 ${answer}。`]);
      }
      if (level === 4) {
        const answer = 2 * n * (n + 1);
        return buildProblem("网格火柴通项", `用火柴拼成 ${n}×${n} 的正方形网格。`, "一共需要多少根火柴？", answer, `${answer} 根`, "横向和纵向分别计数。", [`横向有 ${n + 1} 行，每行 ${n} 根，共 ${n * (n + 1)} 根。`, `纵向同样有 ${n * (n + 1)} 根。`, `总数为 2×${n}×${n + 1}=${answer}。`]);
      }
      const answer = n * (n + 1) ** 2;
      return buildProblem("网格全线段通项", `在 ${n}×${n} 的正方形网格中，只数沿网格线的水平或竖直线段，长短均可。`, "一共有多少条不同的线段？", answer, `${answer} 条`, "在每条网格线上任选两个格点作为端点。", [`每条横线上有 ${n + 1} 个点，可组成 ${n * (n + 1) / 2} 条线段。`, `共有 ${n + 1} 条横线，竖线同样多。`, `总数为 2×${n + 1}×${n * (n + 1) / 2}=${answer}。`]);
    }
    case "triangles": {
      const m = rand(2, 5), n = rand(2, 5), p = rand(2, 4), q = rand(1, 3);
      if (level === 3) {
        const area = rand(20, 60) * 2;
        return buildProblem("中线面积", `三角形 ABC 的面积是 ${area} 平方厘米，AD 是 BC 边上的中线。`, "三角形 ABD 的面积是多少平方厘米？", area / 2, `${area / 2} 平方厘米`, "中线把底边分成相等两段，两个小三角形等高。", ["BD=DC。", "三角形 ABD 与 ACD 等高且底相等，面积相等。", `每个面积为 ${area}÷2=${area / 2}。`]);
      }
      const factorNum = m * q, factorDen = (m + n) * (p + q);
      if (level === 4) {
        const unit = rand(3, 8), total = unit * factorDen;
        const answer = unit * factorNum;
        return buildProblem("两次面积比", `在三角形 ABC 中，D 在 BC 上且 BD:DC=${m}:${n}；E 在 AD 上且 AE:ED=${p}:${q}。三角形 ABC 面积为 ${total}。`, "三角形 BDE 的面积是多少？", answer, String(answer), "先由 BD:BC 求 ABD 占总面积的比例，再由 DE:DA 求 BDE 占 ABD 的比例。", [`S△ABD:S△ABC=${m}:${m + n}。`, `S△BDE:S△BDA=${q}:${p + q}。`, `S△BDE=${total}×${m}/${m + n}×${q}/${p + q}=${answer}。`]);
      }
      const unit = rand(4, 10), small = unit * factorNum, total = unit * factorDen;
      return buildProblem("面积比逆推", `在三角形 ABC 中，D 在 BC 上且 BD:DC=${m}:${n}；E 在 AD 上且 AE:ED=${p}:${q}。三角形 BDE 面积为 ${small}。`, "三角形 ABC 的面积是多少？", total, String(total), "把两次面积比连乘，求出 BDE 占 ABC 的几分之几，再逆推。", [`S△BDE:S△ABC=(${m}/${m + n})×(${q}/${p + q})=${factorNum}/${factorDen}。`, `已知 ${factorNum} 份是 ${small}，每份是 ${unit}。`, `总面积为 ${factorDen}×${unit}=${total}。`]);
    }
    case "polygons": {
      if (level === 3) {
        const n = rand(8, 16), answer = n * (n - 3) / 2;
        return buildProblem("对角线计数", `研究一个 ${n} 边形。`, "它一共有多少条对角线？", answer, `${answer} 条`, "每个顶点可连 n−3 条对角线，最后要除以 2。", [`每个顶点可向 ${n - 3} 个非相邻顶点连对角线。`, `共计 ${n}×${n - 3} 条次。`, `每条被算两次，所以有 ${answer} 条。`]);
      }
      const n = randomItem(level === 4 ? [8, 9, 10, 12, 15] : [12, 15, 18, 20]);
      const exterior = 360 / n;
      if (level === 4) return buildProblem("由外角求边数", `一个正多边形的每个外角是 ${exterior}°。`, "这个正多边形有多少条边？", n, `${n} 条`, "正多边形外角和恒为 360°。", [`边数=360°÷每个外角。`, `360÷${exterior}=${n}。`, `所以是正 ${n} 边形。`]);
      const interior = 180 - exterior, answer = n * (n - 3) / 2;
      return buildProblem("角与对角线综合", `一个正多边形的每个内角是 ${interior}°。`, "这个多边形一共有多少条对角线？", answer, `${answer} 条`, "先由外角求边数，再用对角线公式。", [`每个外角为 180°−${interior}°=${exterior}°。`, `边数为 360°÷${exterior}°=${n}。`, `对角线数为 ${n}×(${n}−3)÷2=${answer}。`]);
    }
    case "remainders": {
      if (level === 3) {
        const base = rand(2, 8), exponent = rand(8, 18), divisor = randomItem([5, 7, 9, 11]);
        const answer = Number(BigInt(base) ** BigInt(exponent) % BigInt(divisor));
        return buildProblem("幂的余数周期", "先观察连续次幂的余数循环。", `${base}^${exponent} 除以 ${divisor} 的余数是多少？`, answer, String(answer), "列出前几次幂的余数，找到循环节。", [`计算 ${base}¹、${base}²、${base}³……除以 ${divisor} 的余数。`, "余数会按固定周期重复。", `按 ${exponent} 在周期中的位置，得到余数 ${answer}。`]);
      }
      const mods = level === 4 ? randomItem([[3, 5], [4, 7], [5, 8]]) : [3, 4, 5];
      const seed = rand(20, mods.reduce((a, b) => a * b, 1) - 1);
      const rems = mods.map((m) => seed % m);
      let answer = 1;
      while (!mods.every((m, i) => answer % m === rems[i])) answer += 1;
      const conditions = mods.map((m, i) => `除以 ${m} 余 ${rems[i]}`).join("，");
      return buildProblem(level === 4 ? "双余数条件" : "三余数条件", "寻找同时满足多个余数条件的最小正整数。", `一个正整数${conditions}。满足条件的最小正整数是多少？`, answer, String(answer), `可从其中一个条件出发，按模数依次增加并检验其他条件。`, [`先列出满足第一个条件的数。`, `逐个检验其余 ${mods.length - 1} 个余数条件。`, `最先同时满足的是 ${answer}。`]);
    }
    default: {
      const p = 2, q = 3, r = 5, a = rand(2, 4), b = rand(1, 3), c = rand(1, 2), number = p ** a * q ** b * r ** c;
      if (level === 3) {
        const answer = (2 ** (a + 1) - 1) * ((3 ** (b + 1) - 1) / 2) * ((5 ** (c + 1) - 1) / 4);
        return buildProblem("约数和", `${number}=2^${a}×3^${b}×5^${c}。`, `${number} 的所有正约数之和是多少？`, answer, String(answer), "分别求每个质因数幂的约数和，再相乘。", [`约数和为 (1+2+…+2^${a})(1+3+…+3^${b})(1+5+…+5^${c})。`, "分别用等比数列求和。", `相乘得到 ${answer}。`]);
      }
      if (level === 4) {
        const multiplier = (a % 2 ? 2 : 1) * (b % 2 ? 3 : 1) * (c % 2 ? 5 : 1);
        return buildProblem("配成完全平方数", `${number}=2^${a}×3^${b}×5^${c}。`, `至少乘多少，才能使乘积成为完全平方数？`, multiplier, String(multiplier), "完全平方数分解质因数后，各质因数指数都是偶数。", [`检查指数 ${a}、${b}、${c} 的奇偶性。`, "给指数为奇数的质因数各补 1 个。", `最小乘数为 ${multiplier}。`]);
      }
      const needP = rand(1, a), needQ = rand(1, b), answer = (a - needP + 1) * (b - needQ + 1) * (c + 1);
      return buildProblem("限制条件约数", `${number}=2^${a}×3^${b}×5^${c}。`, `${number} 的正约数中，能被 2^${needP}×3^${needQ} 整除的有多少个？`, answer, `${answer} 个`, "满足整除条件时，2 和 3 的指数都有下限。", [`2 的指数可选 ${needP} 到 ${a}，共 ${a - needP + 1} 种。`, `3 的指数可选 ${needQ} 到 ${b}，共 ${b - needQ + 1} 种；5 的指数有 ${c + 1} 种。`, `共有 ${a - needP + 1}×${b - needQ + 1}×${c + 1}=${answer} 个。`]);
    }
  }
}

function makeTieredProblem(topic, difficulty) {
  if (difficulty === 1) return makeEasyProblem(topic);
  if (difficulty === 2) return randomItem(GENERATORS[topic])();
  return makeAdvancedProblem(topic, difficulty);
}

const GENERATORS = {
  indeterminate: [makeIndeterminateCount, makeIndeterminateSubtraction, makeIndeterminateApplication],
  inclusion: [makeInclusionProblem],
  pigeonhole: [makePigeonholeProblem],
  combinatorics: [makeCombinatoricsProblem],
  sequences: [makeSequenceProblem],
  fractions: [makeFractionProblem],
  estimation: [makeEstimationProblem],
  geometry_counting: [makeGeometryCountingProblem],
  number_shape: [makeNumberShapeProblem],
  telescoping: [makeTelescopingProblem],
  induction: [makeInductionProblem],
  triangles: [makeTriangleProblem],
  polygons: [makePolygonProblem],
  remainders: [makeRemainderProblem],
  prime_factors: [makePrimeFactorProblem]
};

function weightedTopic() {
  const weighted = TOPICS.map((topic) => {
    const savedWrong = state.mistakes.filter((item) => item.topic === topic.id).reduce((sum, item) => sum + (item.times || 1), 0);
    const stats = state.topicStats?.[topic.id];
    const errorRateBoost = stats?.attempts ? Math.round((1 - stats.correct / stats.attempts) * 3) : 0;
    return { id: topic.id, weight: 1 + savedWrong * 3 + errorRateBoost };
  });
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let ticket = Math.random() * total;
  for (const item of weighted) {
    ticket -= item.weight;
    if (ticket <= 0) return item.id;
  }
  return weighted.at(-1).id;
}

function createProblem() {
  let problem;
  let guard = 0;
  do {
    const topic = practiceKind === "topic" ? selectedTopic : mixedStrategy === "weighted" ? weightedTopic() : randomItem(TOPICS).id;
    const difficulty = selectedDifficulty === "random" ? rand(1, 5) : Number(selectedDifficulty);
    problem = makeTieredProblem(topic, difficulty);
    problem.topic = topic;
    problem.difficulty = difficulty;
    problem.signature = `${topic}|${difficulty}|${problem.prompt}`;
    guard += 1;
  } while (problem.signature === lastSignature && guard < 8);
  lastSignature = problem.signature;
  return problem;
}

function newProblem(problem = null) {
  currentProblem = problem || createProblem();
  currentProblem.topic ||= "indeterminate";
  currentProblem.difficulty ||= 2;
  currentProblem.answerValue ??= currentProblem.answer;
  questionNumber += 1;
  answered = false;
  $("#problemType").textContent = `${topicTitle(currentProblem.topic)} · ${currentProblem.tag}`;
  $("#problemDifficulty").textContent = `${currentProblem.difficulty}⭐ · ${DIFFICULTY_LABELS[currentProblem.difficulty]}`;
  $("#problemNumber").textContent = `第 ${questionNumber} 题`;
  $("#problemContext").textContent = currentProblem.context;
  $("#problemText").textContent = currentProblem.prompt;
  $("#answerInput").value = "";
  $("#answerInput").disabled = false;
  $("#submitAnswer").disabled = false;
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";
  $("#hintBox").hidden = true;
  $("#solutionPanel").hidden = true;
  $("#solutionAnswer").textContent = currentProblem.answerDisplay;
  $("#solutionSteps").innerHTML = currentProblem.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("");
  updateSaveButton();
  updatePracticeSummary();
  setTimeout(() => $("#answerInput").focus({ preventScroll: true }), 80);
}

function parseUserAnswer(raw) {
  const normalized = raw.trim().replace(/，/g, ".").replace(/÷/g, "/");
  const match = normalized.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (match) {
    const denominator = Number(match[2]);
    return denominator === 0 ? NaN : Number(match[1]) / denominator;
  }
  return Number(normalized);
}

function submitAnswer() {
  if (answered) return;
  const raw = $("#answerInput").value.trim();
  const value = parseUserAnswer(raw);
  if (!raw || Number.isNaN(value)) {
    $("#feedback").textContent = "请填入一个数字；分数可以写成 3/4。";
    $("#feedback").className = "feedback error";
    return;
  }
  answered = true;
  state.attempts += 1;
  state.topicStats ||= {};
  state.topicStats[currentProblem.topic] ||= { attempts: 0, correct: 0 };
  state.topicStats[currentProblem.topic].attempts += 1;
  const correct = Math.abs(value - Number(currentProblem.answerValue)) < 1e-9;
  if (correct) {
    state.correct += 1;
    state.streak += 1;
    state.topicStats[currentProblem.topic].correct += 1;
    $("#feedback").textContent = randomItem(["答对了！思路很稳。", "正确！继续保持。", "漂亮，这一步掌握了！"]);
    $("#feedback").className = "feedback success";
  } else {
    state.streak = 0;
    $("#feedback").textContent = `还差一点，正确答案是 ${currentProblem.answerDisplay}。看看解析找出卡点。`;
    $("#feedback").className = "feedback error";
    addMistake(currentProblem, false, false);
  }
  $("#solutionPanel").hidden = false;
  $("#answerInput").disabled = true;
  $("#submitAnswer").disabled = true;
  saveState();
}

function addMistake(problem, notify = true, persist = true) {
  const existing = state.mistakes.find((item) => item.signature === problem.signature);
  if (existing) {
    existing.times = (existing.times || 1) + 1;
    existing.savedAt = Date.now();
  } else {
    state.mistakes.unshift({ ...problem, times: 1, savedAt: Date.now() });
  }
  state.mistakes = state.mistakes.slice(0, 50);
  if (persist) saveState();
  updateSaveButton();
  if (notify) showToast(existing ? "这道题已在错题本中" : "已加入错题本");
}

function removeMistake(signature) {
  state.mistakes = state.mistakes.filter((item) => item.signature !== signature);
  saveState();
  updateSaveButton();
}

function updateSaveButton() {
  if (!currentProblem) return;
  const saved = state.mistakes.some((item) => item.signature === currentProblem.signature);
  $("#saveMistake").textContent = saved ? "✓ 已在错题本" : "＋ 加入错题本";
  $("#saveMistake").classList.toggle("saved", saved);
}

function updatePracticeSummary() {
  const difficultyText = selectedDifficulty === "random" ? "随机难度" : `${selectedDifficulty}⭐ ${DIFFICULTY_LABELS[selectedDifficulty]}`;
  if (practiceKind === "topic") {
    $("#practiceSummary").textContent = `正在练习：${topicTitle(selectedTopic)} · ${difficultyText}`;
  } else {
    const strategyText = mixedStrategy === "balanced" ? "15 专题均衡随机" : "薄弱专题优先";
    $("#practiceSummary").textContent = `综合练习 · ${strategyText} · ${difficultyText}`;
  }
}

function renderStats() {
  $("#statAttempts").textContent = state.attempts;
  $("#statAccuracy").textContent = state.attempts ? `${Math.round(state.correct / state.attempts * 100)}%` : "—";
  $("#statStreak").textContent = state.streak;
  $("#navMistakeCount").textContent = state.mistakes.length;
}

function renderMistakes() {
  const list = $("#mistakeList");
  $("#emptyMistakes").hidden = state.mistakes.length > 0;
  $("#clearMistakes").hidden = state.mistakes.length === 0;
  list.innerHTML = state.mistakes.map((item, index) => `
    <article class="mistake-item">
      <span class="mistake-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="mistake-copy">
        <h3>${escapeHTML(item.prompt)}</h3>
        <p>${escapeHTML(topicTitle(item.topic))} · ${item.difficulty || 2}⭐ · ${escapeHTML(item.tag)} · 答案 ${escapeHTML(item.answerDisplay)}${item.times > 1 ? ` · 遇错 ${item.times} 次` : ""}</p>
      </div>
      <div class="mistake-actions">
        <button class="small-button retry-button" data-signature="${escapeAttr(item.signature)}">再练一次</button>
        <button class="small-button remove-button" data-signature="${escapeAttr(item.signature)}" aria-label="移除错题">移除</button>
      </div>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

const escapeAttr = (value) => escapeHTML(value);

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 1800);
}

$$('[data-practice-kind]').forEach((button) => {
  button.addEventListener("click", () => {
    practiceKind = button.dataset.practiceKind;
    $$('[data-practice-kind]').forEach((item) => item.classList.toggle("active", item === button));
    $("#topicControl").hidden = practiceKind !== "topic";
    $("#strategyControl").hidden = practiceKind !== "mixed";
    newProblem();
  });
});

$("#topicSelect").addEventListener("change", (event) => {
  selectedTopic = event.target.value;
  newProblem();
});

$$('[data-strategy]').forEach((button) => {
  button.addEventListener("click", () => {
    mixedStrategy = button.dataset.strategy;
    $$('[data-strategy]').forEach((item) => item.classList.toggle("active", item === button));
    newProblem();
  });
});

$$('[data-difficulty]').forEach((button) => {
  button.addEventListener("click", () => {
    selectedDifficulty = button.dataset.difficulty;
    $$('[data-difficulty]').forEach((item) => item.classList.toggle("active", item === button));
    newProblem();
  });
});

$("#submitAnswer").addEventListener("click", submitAnswer);
$("#answerInput").addEventListener("keydown", (event) => { if (event.key === "Enter") submitAnswer(); });
$("#nextProblem").addEventListener("click", () => newProblem());
$("#showHint").addEventListener("click", () => {
  $("#hintText").textContent = currentProblem.hint;
  $("#hintBox").hidden = false;
});
$("#showSolution").addEventListener("click", () => {
  $("#solutionPanel").hidden = false;
  $("#solutionPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
});
$("#saveMistake").addEventListener("click", () => addMistake(currentProblem));

$("#mistakeList").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const signature = button.dataset.signature;
  if (button.classList.contains("remove-button")) removeMistake(signature);
  if (button.classList.contains("retry-button")) {
    const problem = state.mistakes.find((item) => item.signature === signature);
    if (problem) {
      newProblem(problem);
      $("#practice").scrollIntoView({ behavior: "smooth" });
    }
  }
});

$("#clearMistakes").addEventListener("click", () => {
  if (window.confirm("确定清空全部错题吗？练习统计会保留。")) {
    state.mistakes = [];
    saveState();
    updateSaveButton();
    showToast("错题本已清空");
  }
});

renderStats();
renderMistakes();
newProblem();
