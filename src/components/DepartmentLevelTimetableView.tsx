import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ScheduleRow {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  course_code?: string;
  course_name?: string;
  venue_name?: string;
  lecturer_name?: string;
  group_level?: string | number;
  class_group_id?: number;
  group_name?: string;
}

interface DepartmentLevelTimetableViewProps {
  session: string;
  semester: string;
  department: string;
  level?: string;
  scope: 'department' | 'level';
  onBack: () => void;
  sessionId: number;
}

// Same time slots as StudentTimetableView (7 AM–6 PM). 1–2 PM = BREAK.
const STANDARD_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 7; h <= 17; h++) {
    const end = h + 1;
    const h12Start = h === 12 ? 12 : h > 12 ? h - 12 : h;
    const h12End = end === 12 ? 12 : end > 12 ? end - 12 : end;
    const ampmEnd = end < 12 ? 'am' : 'pm';
    slots.push(`${h12Start}:00-${h12End}:00${ampmEnd}`);
  }
  return slots;
})();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type TimetableRow = { day: string; start_time?: string; end_time?: string; courseCode: string; venue: string; lecturer: string };
type TimetableRowWithGroup = TimetableRow & { groupName: string; level?: string };

type CellInfo =
  | { type: 'skip' }
  | { type: 'course'; entry: TimetableRow; span: number }
  | { type: 'courses'; entries: { entry: TimetableRowWithGroup; groupName: string; level?: string }[] }
  | { type: 'special'; label: string }
  | { type: 'empty' };

function getSlotIndices(startTime?: string, endTime?: string): number[] {
  if (!startTime || !endTime) return [];
  const toMins = (t: string) => {
    const [h, m] = String(t).slice(0, 5).split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const start = toMins(startTime);
  const end = toMins(endTime);
  const indices: number[] = [];
  for (let i = 0; i < STANDARD_TIME_SLOTS.length; i++) {
    const slotStart = (7 + i) * 60;
    const slotEnd = (8 + i) * 60;
    if (start < slotEnd && end > slotStart) indices.push(i);
  }
  return indices;
}

function getCellForSlot(
  day: string,
  slotIndex: number,
  timetableData: TimetableRow[],
  getSpecialForSlot?: (day: string, timeSlot: string) => string | null
): CellInfo {
  if (slotIndex === 6) return { type: 'special', label: 'BREAK' };
  const entry = timetableData.find((e) => {
    if (e.day !== day) return false;
    const indices = getSlotIndices(e.start_time, e.end_time);
    return indices.includes(slotIndex);
  });
  if (!entry) return { type: 'empty' };
  const indices = getSlotIndices(entry.start_time, entry.end_time);
  const isFirstSlot = indices[0] === slotIndex;
  if (!isFirstSlot) return { type: 'skip' };
  return { type: 'course', entry, span: indices.length };
}

/** For level view: one cell per slot, all groups listed. No colSpan. 1-2 PM always BREAK. */
function getCellForSlotLevel(
  day: string,
  slotIndex: number,
  levelData: TimetableRowWithGroup[],
  _getSpecialForSlot?: (day: string, timeSlot: string) => string | null
): CellInfo {
  if (slotIndex === 6) return { type: 'special', label: 'BREAK' };
  const entries = levelData.filter((e) => {
    if (e.day !== day) return false;
    const indices = getSlotIndices(e.start_time, e.end_time);
    return indices.length > 0 && indices[0] === slotIndex;
  });
  if (entries.length === 0) return { type: 'empty' };
  return { type: 'courses', entries: entries.map((e) => ({ entry: e, groupName: e.groupName, level: e.level })) };
}

const caps = (s: string | undefined) => (s || '—').toUpperCase();
const venueCase = (s: string | undefined) =>
  (s || '—').toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
const lecturerFirst = (name: string | undefined) => {
  const word = (name || '').trim().split(/\s+/)[0] || name || '—';
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '—';
};

export function DepartmentLevelTimetableView({
  session,
  semester,
  department,
  level,
  scope,
  onBack,
  sessionId,
}: DepartmentLevelTimetableViewProps) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ScheduleRow[]>([]);
  const [specialEvents, setSpecialEvents] = useState<{ day_of_week: string; start_time: string; end_time: string; event_name?: string; event_type?: string }[]>([]);
  const [notPublished, setNotPublished] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [timetableRes, eventsRes] = await Promise.all([
          Api.getPublicTimetableByDepartment(sessionId, department) as { success?: boolean; data?: ScheduleRow[]; published?: boolean },
          sessionId ? (Api.getSpecialEvents({ session_id: sessionId }) as Promise<{ success?: boolean; data?: { day_of_week: string; start_time: string; end_time: string; event_name?: string; event_type?: string }[] }>) : Promise.resolve({ success: true, data: [] }),
        ]);
        if (cancelled) return;
        const list = (timetableRes?.success && Array.isArray(timetableRes?.data)) ? timetableRes.data : [];
        setEntries(list);
        setNotPublished(timetableRes?.published === false);
        const evList = (eventsRes?.success && Array.isArray(eventsRes?.data)) ? eventsRes.data : [];
        setSpecialEvents(evList);
      } catch (_) {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, department]);

  const getSpecialEventForSlot = useMemo(() => {
    return (day: string, timeSlot: string): string | null => {
      const m = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
      if (!m || !specialEvents.length) return null;
      const toMinutes = (h: number, min: number, ampm: string) => {
        if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + min;
      };
      const slotStart = toMinutes(parseInt(m[1], 10), parseInt(m[2], 10), m[3]);
      const slotEnd = toMinutes(parseInt(m[4], 10), parseInt(m[5], 10), m[6]);
      for (const ev of specialEvents) {
        const dayMatch = ev.day_of_week === 'All' || ev.day_of_week === day;
        const [sh, sm] = String(ev.start_time).slice(0, 5).split(':').map(Number);
        const [eh, em] = String(ev.end_time).slice(0, 5).split(':').map(Number);
        const evStart = (sh || 0) * 60 + (sm || 0);
        const evEnd = (eh || 0) * 60 + (em || 0);
        const overlaps = slotStart < evEnd && slotEnd > evStart;
        if (dayMatch && overlaps) {
          const name = (ev.event_name && ev.event_name.trim()) || (ev.event_type === 'lunch' ? 'Break' : ev.event_type === 'chapel' ? 'CHAPEL SEMINAR' : ev.event_type || '');
          return ev.event_type === 'chapel' ? (ev.event_name && ev.event_name.trim() ? ev.event_name.trim() : name) : name;
        }
      }
      return null;
    };
  }, [specialEvents]);

  const filtered = useMemo(() => {
    if (scope !== 'level' || level == null) return entries;
    return entries.filter((e) => String(e.group_level ?? '') === String(level));
  }, [entries, scope, level]);

  /** Level scope: one section, all groups for that level. Department scope: one section, all levels and groups in one grid. */
  const sections = useMemo(() => {
    if (scope === 'department') {
      const departmentTimetableData: TimetableRowWithGroup[] = entries.map((r) => ({
        day: r.day_of_week || '',
        start_time: r.start_time,
        end_time: r.end_time,
        courseCode: r.course_code || r.course_name || '—',
        venue: r.venue_name || '—',
        lecturer: r.lecturer_name || '—',
        groupName: r.group_name ?? `Class ${r.class_group_id ?? ''}`,
        level: String(r.group_level ?? ''),
      })).filter((r) => r.day);
      if (departmentTimetableData.length === 0) return [];
      return [{ level: '', groupName: 'All Levels & Groups', timetableData: departmentTimetableData, combined: true as const }];
    }
    if (scope === 'level' && level != null) {
      const levelTimetableData: TimetableRowWithGroup[] = filtered.map((r) => ({
        day: r.day_of_week || '',
        start_time: r.start_time,
        end_time: r.end_time,
        courseCode: r.course_code || r.course_name || '—',
        venue: r.venue_name || '—',
        lecturer: r.lecturer_name || '—',
        groupName: r.group_name ?? `Class ${r.class_group_id ?? ''}`,
      })).filter((r) => r.day);
      if (levelTimetableData.length === 0) return [];
      return [{ level: String(level), groupName: 'All Groups', timetableData: levelTimetableData, combined: true as const }];
    }
    return [];
  }, [entries, filtered, scope, level]);

  const handleDownloadPDF = async () => {
    if (sections.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 10;
      const tableWidth = pageW - margin * 2;

      doc.setFillColor(15, 32, 68);
      doc.rect(0, 0, pageW, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(scope === 'department' ? 'Department Timetable' : 'Level Timetable', pageW / 2, 12, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const subTitle = scope === 'level' && level ? `Level ${level} (All Groups) · ${department}` : department;
      doc.text(`${subTitle}  |  ${session}  |  ${semester}  |  ${new Date().toLocaleDateString('en-US')}`, pageW / 2, 18, { align: 'center' });

      const dayColWidth = 26;
      const timeColWidth = (tableWidth - dayColWidth) / STANDARD_TIME_SLOTS.length;
      const tableFontSize = 7;
      const tableCellPadding = 2;

      let y = 26;
      for (const section of sections) {
        if (y > 250) {
          doc.addPage('landscape', 'a4');
          y = 20;
        }
        if (section.combined) {
          const levelData = section.timetableData as TimetableRowWithGroup[];
          if (section.level) {
            doc.setTextColor(15, 32, 68);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Level ${section.level} — All Groups`, margin, y);
            y += 6;
          }

          const tableData = DAYS.map((day) => {
            const row: string[] = [day];
            for (let slotIndex = 0; slotIndex < STANDARD_TIME_SLOTS.length; slotIndex++) {
              const cell = getCellForSlotLevel(day, slotIndex, levelData, getSpecialEventForSlot);
              const levelLabel = (gn: string, entryLevel?: string) => {
                const short = (gn || '').replace(/^Group\s+/i, '').trim() || gn;
                return (entryLevel ?? section.level) ? `${entryLevel ?? section.level} ${short}` : short;
              };
              const content =
                cell.type === 'special' ? cell.label
                  : cell.type === 'courses'
                    ? cell.entries.map(({ entry, groupName, level: entryLevel }) => `${levelLabel(groupName, entryLevel)}: ${caps(entry.courseCode)} ${venueCase(entry.venue)} ${lecturerFirst(entry.lecturer)}`).join('\n')
                    : '-';
              row.push(content);
            }
            return row;
          });

          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Day', ...STANDARD_TIME_SLOTS]],
            body: tableData,
            theme: 'grid',
            tableWidth,
            tableLineWidth: 0.25,
            headStyles: { fillColor: [15, 32, 68], textColor: [255, 255, 255], fontSize: tableFontSize, cellPadding: tableCellPadding },
            bodyStyles: { fontSize: tableFontSize, cellPadding: tableCellPadding, valign: 'middle', overflow: 'linebreak' },
            columnStyles: {
              '0': { cellWidth: dayColWidth, fontStyle: 'bold' },
              ...Object.fromEntries(STANDARD_TIME_SLOTS.map((_, i) => [String(i + 1), { cellWidth: timeColWidth }])),
            },
          });
        } else {
          doc.setTextColor(15, 32, 68);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`Level ${section.level} — ${section.groupName}`, margin, y);
          y += 6;

          const tableData = DAYS.map((day) => {
            const row: (string | { content: string; colSpan: number })[] = [day];
            let slotIndex = 0;
            while (slotIndex < STANDARD_TIME_SLOTS.length) {
              const cell = getCellForSlot(day, slotIndex, section.timetableData, getSpecialEventForSlot);
              const content =
                cell.type === 'course'
                  ? `${caps(cell.entry.courseCode)}\n${venueCase(cell.entry.venue)}\n${lecturerFirst(cell.entry.lecturer)}`
                  : cell.type === 'special'
                    ? cell.label
                    : cell.type === 'skip'
                      ? (() => {
                          const entry = section.timetableData.find((e) => e.day === day && getSlotIndices(e.start_time, e.end_time).includes(slotIndex));
                          return entry ? `${caps(entry.courseCode)}\n${venueCase(entry.venue)}\n${lecturerFirst(entry.lecturer)}` : '-';
                        })()
                      : '-';
              if (cell.type === 'course' && cell.span > 1) {
                row.push({ content, colSpan: cell.span });
                slotIndex += cell.span;
              } else {
                row.push(content);
                slotIndex += 1;
              }
            }
            return row;
          });

          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Day', ...STANDARD_TIME_SLOTS]],
            body: tableData,
            theme: 'grid',
            tableWidth,
            tableLineWidth: 0.25,
            headStyles: { fillColor: [15, 32, 68], textColor: [255, 255, 255], fontSize: tableFontSize, cellPadding: tableCellPadding },
            bodyStyles: { fontSize: tableFontSize, cellPadding: tableCellPadding, valign: 'middle', overflow: 'linebreak' },
            columnStyles: {
              '0': { cellWidth: dayColWidth, fontStyle: 'bold' },
              ...Object.fromEntries(STANDARD_TIME_SLOTS.map((_, i) => [String(i + 1), { cellWidth: timeColWidth }])),
            },
          });
        }
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      const fileName = `Timetable_${department.replace(/\s+/g, '_')}_${scope === 'level' ? `Level${level}_` : ''}${semester}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2044] mx-auto mb-4" />
          <p className="text-slate-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0f2044] border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              {scope === 'department' ? 'Department Timetable' : 'Level Timetable'}
            </h1>
            <p className="text-sm sm:text-base text-white font-normal mt-1.5">
              School of Computing Timetable System
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button
              onClick={onBack}
              className="border border-white/30 bg-white text-[#0f2044] hover:bg-slate-100 font-medium shadow-sm"
            >
              <ArrowLeft className="mr-2 size-4 text-[#0f2044]" />
              <span className="text-[#0f2044]">Back to Search</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!notPublished && sections.length > 0 && (
          <Card className="mb-6 shadow-lg border-t-4 border-t-[#ffb71b]">
            <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b]">
              <CardTitle className="text-white">Summary</CardTitle>
              <p className="text-slate-300 text-sm mt-1">View your schedule below; you can download it as PDF.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Department</p>
                  <p className="text-sm font-semibold text-[#0f2044]">{department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Session</p>
                  <p className="text-sm font-semibold text-[#0f2044]">{session.replace(/-/g, '/')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Semester</p>
                  <p className="text-sm font-semibold text-[#0f2044]">{semester}</p>
                </div>
                {scope === 'level' && level != null && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">Level</p>
                    <p className="text-sm font-semibold text-[#0f2044]">{level}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isExporting || sections.length === 0}
                  className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                >
                  {isExporting ? (
                    <span className="flex items-center gap-2"><span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" /> Generating...</span>
                  ) : (
                    <><Download className="mr-2 size-4" /> Download as PDF</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notPublished ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-8 text-center">
              <p className="text-amber-800 font-medium">Timetable not yet published for this session.</p>
              <p className="text-sm text-amber-700 mt-1">Only published timetables are visible.</p>
            </CardContent>
          </Card>
        ) : sections.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center text-slate-600">
              No scheduled entries for {scope === 'level' ? `Level ${level}` : department}.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <Card key={section.combined ? `level-${section.level}` : `${section.level}-${(section as { groupId?: number }).groupId}`} className="border-slate-200 shadow overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b] text-white rounded-t-lg py-3">
                  <CardTitle className="text-base">
                    {section.level ? `Level ${section.level} — ${section.combined ? 'All Groups' : section.groupName}` : section.groupName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <colgroup>
                        <col style={{ width: '9rem' }} />
                        {STANDARD_TIME_SLOTS.map((_, i) => (
                          <col key={i} style={{ width: `calc((100% - 9rem) / ${STANDARD_TIME_SLOTS.length})` }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr className="bg-[#0f2044]">
                          <th className="border border-slate-300 px-5 py-3 text-left text-white font-semibold sticky left-0 z-10 bg-[#0f2044] text-sm">
                            Day
                          </th>
                          {STANDARD_TIME_SLOTS.map((header, i) => (
                            <th key={i} className="border border-slate-300 px-2 py-2.5 text-center text-white font-semibold text-xs overflow-hidden text-ellipsis min-w-0" style={{ width: 'calc((100% - 9rem) / 11)' }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day, rowIndex) => (
                          <tr key={day} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className={`border border-slate-300 px-5 py-3 font-semibold text-[#0f2044] text-sm sticky left-0 z-10 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                              {day}
                            </td>
                            {section.combined ? (
                              STANDARD_TIME_SLOTS.map((_, slotIndex) => {
                                const cell = getCellForSlotLevel(day, slotIndex, section.timetableData as TimetableRowWithGroup[], getSpecialEventForSlot);
                                const isBreakSlot = cell.type === 'special' && (cell.label === 'BREAK' || cell.label.toLowerCase() === 'break' || cell.label.toLowerCase() === 'lunch');
                                const bgClass = isBreakSlot ? 'bg-amber-50' : cell.type === 'courses' ? 'bg-white' : cell.type === 'special' ? 'bg-blue-50/80' : 'bg-slate-50/50';
                                return (
                                  <td key={slotIndex} className={`border border-slate-300 align-top min-w-0 overflow-hidden ${bgClass}`} style={{ minHeight: '4.5rem' }}>
                                    <div className={`flex flex-col min-h-[4rem] p-2 text-left text-sm ${isBreakSlot ? 'justify-center' : ''}`}>
                                      {isBreakSlot && cell.type === 'special' ? (
                                        <span className="text-amber-800 font-medium">{cell.label}</span>
                                      ) : cell.type === 'courses' ? (
                                        cell.entries.map(({ entry, groupName, level: entryLevel }, i) => {
                                          const shortGroup = (groupName || '').replace(/^Group\s+/i, '').trim() || groupName;
                                          const levelGroupLabel = (entryLevel ?? section.level) ? `${entryLevel ?? section.level} ${shortGroup}` : shortGroup;
                                          return (
                                            <div key={i} className="border-b border-slate-100 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                                              <span className="font-semibold text-[#0f2044]">{levelGroupLabel}</span>
                                              <span className="font-bold block">{caps(entry.courseCode)}</span>
                                              <span className="text-xs text-slate-600 block">{venueCase(entry.venue)} · {lecturerFirst(entry.lecturer)}</span>
                                            </div>
                                          );
                                        })
                                      ) : cell.type === 'special' ? (
                                        <span className="text-blue-800 font-medium">{cell.label}</span>
                                      ) : (
                                        <span className="text-slate-400">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })
                            ) : (
                              STANDARD_TIME_SLOTS.map((_, slotIndex) => {
                                const cell = getCellForSlot(day, slotIndex, section.timetableData, getSpecialEventForSlot);
                                if (cell.type === 'skip') return null;
                                const colSpan = cell.type === 'course' ? cell.span : 1;
                                const isBreakSlot = cell.type === 'special' && (cell.label === 'BREAK' || cell.label.toLowerCase() === 'break' || cell.label.toLowerCase() === 'lunch');
                                const isMultiHour = cell.type === 'course' && colSpan > 1;
                                const bgClass = isBreakSlot ? 'bg-amber-50' : cell.type === 'course' ? 'bg-white' : cell.type === 'special' ? 'bg-blue-50/80' : 'bg-slate-50/50';
                                return (
                                  <td
                                    key={slotIndex}
                                    colSpan={colSpan}
                                    className={`border border-slate-300 align-top min-w-0 overflow-hidden ${bgClass}`}
                                    style={{ minHeight: '4.5rem', ...(isMultiHour ? { minHeight: `${colSpan * 4.5}rem` } : {}) }}
                                  >
                                    <div className={`flex flex-col min-h-[4rem] p-2 ${isBreakSlot ? 'items-start justify-center text-left' : 'items-center justify-center text-center'}`}>
                                      {isBreakSlot && cell.type === 'special' ? (
                                        <span className="text-amber-800 font-medium text-sm">{cell.label}</span>
                                      ) : cell.type === 'course' ? (
                                        <div className="flex flex-col items-center gap-1 w-full text-[#0f2044]">
                                          <span className="font-bold text-sm">{caps(cell.entry.courseCode)}</span>
                                          <span className="text-xs text-slate-600 leading-tight">{venueCase(cell.entry.venue)}</span>
                                          <span className="text-xs text-slate-600">{lecturerFirst(cell.entry.lecturer)}</span>
                                        </div>
                                      ) : cell.type === 'special' ? (
                                        <span className="text-blue-800 font-medium text-sm">{cell.label}</span>
                                      ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
