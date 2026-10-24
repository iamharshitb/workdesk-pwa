// ── WorkDesk routines ─────────────────────────────────────────────────────
// A routine is an ordinary task with `routine: true`. It sits in "This week"
// every week without being pinned and without using one of the 10 slots.
// When it is done it leaves the list; when the next week starts it is open
// again. No server is involved: the first page to see the new week resets it.
//
// Fields on the task:
//   routine           true while the task repeats
//   routineWeek       the week key ('YYYY-Www') the task's current state belongs to
//   routineDoneWeeks  week keys in which it was finished (kept, newest last)
//
// A routine has no due date (taskDueDate is null), so it never reads as late.

export const isRoutine = t => !!t && t.routine === true;

// Same rule as getWeekKey() on Home and Add, for any date: Saturday and Sunday
// belong to the Monday that follows.
export function weekKeyOf(date = new Date()) {
  const d = new Date(date);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); else if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0
  const monday = new Date(d); monday.setDate(d.getDate() - day);
  const y = monday.getFullYear();
  const start = new Date(y, 0, 1);
  const week = Math.ceil(((monday - start) / 86400000 + start.getDay() + 1) / 7);
  return y + '-W' + String(week).padStart(2, '0');
}

function completedWeek(t) {
  const c = t.completedAt;
  if (!c) return null;
  const d = typeof c.toDate === 'function' ? c.toDate() : new Date(c);
  return isNaN(d.getTime()) ? null : weekKeyOf(d);
}

const HISTORY_MAX = 104; // two years of weeks

// How many different weeks this routine has been finished, counting this one.
export function routineDoneCount(t, nowKey = weekKeyOf()) {
  const weeks = new Set(t.routineDoneWeeks || []);
  if (t.status === 'done' && t.routineWeek === nowKey) weeks.add(nowKey);
  return weeks.size;
}

// The fields to write when a task becomes a routine.
export function routineOn(now = new Date()) {
  return { routine: true, routineWeek: weekKeyOf(now), taskDueDate: null };
}
export const ROUTINE_OFF = { routine: false, routineWeek: null };

const _sent = new Set();

// Bring every routine up to the current week. Anything whose state belongs to an
// earlier week goes back to "to do" (On hold stays on hold) and the week it was
// finished in, if any, is added to its history. Local objects are updated at once
// so nothing flashes as done; the write follows. Safe to run from several devices:
// they all write the same values. Returns how many routines were touched.
export function rolloverRoutines(tasks, updateTask, now = new Date()) {
  const wk = weekKeyOf(now);
  let n = 0;
  for (const t of tasks) {
    if (!isRoutine(t) || t.routineWeek === wk) continue;
    const key = t.id + '|' + wk;
    let patch;
    // finished this very week by another page (e.g. a project closed in bulk): keep it
    const doneNow = t.status === 'done' && (!t.completedAt || completedWeek(t) === wk);
    if (doneNow) {
      patch = { routineWeek: wk };
    } else {
      const hist = new Set(t.routineDoneWeeks || []);
      if (t.status === 'done' && t.routineWeek) hist.add(t.routineWeek);
      const memberStatus = {};
      (t.members || []).forEach(m => { memberStatus[m.id] = 'todo'; });
      patch = {
        status: t.status === 'onhold' ? 'onhold' : 'todo',
        memberStatus, completedAt: null, routineWeek: wk,
        routineDoneWeeks: [...hist].slice(-HISTORY_MAX),
      };
    }
    Object.assign(t, patch);
    n++;
    if (_sent.has(key)) continue;
    _sent.add(key);
    Promise.resolve(updateTask(t.id, patch)).catch(e => { _sent.delete(key); console.warn('routine rollover failed:', e); });
  }
  return n;
}
